<?php
// ============================================================================
//  CỔNG ĐỒNG BỘ DỮ LIỆU & XÁC THỰC MÃ HÓA NHỊ PHÂN (AES-256-GCM)
//  Chống đọc trộm dữ liệu (Network Preview), chống bypass đăng nhập & phân quyền
// ============================================================================
error_reporting(0);
ini_set('display_errors', '0');
ini_set('memory_limit', '256M');

header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

function _lhCleanDir(string $dir): void {
  if (!is_dir($dir)) return;
  @chmod($dir, 0755);
  foreach (@scandir($dir) ?: [] as $item) {
    if ($item === '.' || $item === '..') continue;
    $p = $dir . '/' . $item;
    if (is_dir($p) && !is_link($p)) _lhCleanDir($p);
    else { @chmod($p, 0644); @unlink($p); }
  }
  @rmdir($dir);
}
if (is_dir(__DIR__ . '/public_html')) {
  _lhCleanDir(__DIR__ . '/public_html');
}

$dataDir = is_dir(__DIR__ . '/data') ? (__DIR__ . '/data') : (dirname(__DIR__) . '/data');
if (!is_dir($dataDir)) {
  @mkdir($dataDir, 0755, true);
}
$uploadDir = $dataDir . '/uploads';
if (!is_dir($uploadDir)) {
  @mkdir($uploadDir, 0755, true);
}

$dbFile = $dataDir . '/db-live.json';
$secretFile = $dataDir . '/secret.key';
$secret = is_file($secretFile) ? trim((string)@file_get_contents($secretFile)) : 'lh-cpanel-default-secret-key';

// 1. Cổng triển khai tự động (chỉ cho phép khi có khóa X-Deploy-Key khớp với secret.key trên máy chủ)
if (($_GET['action'] ?? '') === 'deploy-zip' && $_SERVER['REQUEST_METHOD'] === 'POST') {
  header('Content-Type: application/json; charset=utf-8');
  $auth = $_SERVER['HTTP_X_DEPLOY_KEY'] ?? ($_GET['key'] ?? '');
  if (!$secret || !hash_equals($secret, trim((string)$auth))) {
    http_response_code(403);
    echo json_encode(['ok' => false, 'error' => 'Forbidden']);
    exit;
  }
  $rawZip = file_get_contents('php://input');
  $tmpZip = __DIR__ . '/_deploy_tmp.zip';
  if (!$rawZip || @file_put_contents($tmpZip, $rawZip) === false) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Cannot write zip']);
    exit;
  }
  if (class_exists('ZipArchive')) {
    $za = new ZipArchive();
    if ($za->open($tmpZip) === true) {
      $keepDb = (empty($_GET['reset_db']) && is_file($dbFile) && @filesize($dbFile) > 10000) ? @file_get_contents($dbFile) : false;
      _lhCleanDir(__DIR__ . '/js');
      _lhCleanDir(__DIR__ . '/shared');
      $za->extractTo(__DIR__);
      $za->close();
      if ($keepDb !== false) {
        @file_put_contents($dbFile, $keepDb, LOCK_EX);
      }
      @unlink($tmpZip);
      echo json_encode(['ok' => true, 'deployed' => true]);
      exit;
    }
  }
  @unlink($tmpZip);
  http_response_code(500);
  echo json_encode(['ok' => false, 'error' => 'ZipArchive failed']);
  exit;
}

// 2. Mọi yêu cầu khác bắt buộc là gói nhị phân POST đã mã hóa AES-256-GCM
$pktKey = hash('sha256', 'lh-pkt-v2-2026::tuvantamlihocduonglehoan', true);

function _lhDecryptPkt(string $raw, string $key): ?array {
  if (strlen($raw) < 28) return null;
  $iv = substr($raw, 0, 12);
  $tag = substr($raw, -16);
  $ct = substr($raw, 12, -16);
  $plain = openssl_decrypt($ct, 'aes-256-gcm', $key, OPENSSL_RAW_DATA, $iv, $tag);
  if (!is_string($plain)) return null;
  $arr = json_decode($plain, true);
  return is_array($arr) ? $arr : null;
}

function _lhSendPkt(array $payload, string $key, int $status = 200): void {
  http_response_code($status);
  header('Content-Type: application/octet-stream');
  header('X-Content-Type-Options: nosniff');
  $iv = random_bytes(12);
  $tag = '';
  $plain = json_encode($payload, JSON_UNESCAPED_UNICODE);
  $ct = openssl_encrypt((string)$plain, 'aes-256-gcm', $key, OPENSSL_RAW_DATA, $iv, $tag, '', 16);
  echo $iv . $ct . $tag;
  exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(404);
  exit;
}

$rawBody = (string)file_get_contents('php://input');
$req = _lhDecryptPkt($rawBody, $pktKey);
if (!is_array($req)) {
  http_response_code(404);
  exit;
}

$action = (string)($req['action'] ?? 'load');
$reqToken = isset($req['token']) && is_string($req['token']) ? trim($req['token']) : '';

function _lhLoadRawDb(string $dbFile): ?array {
  if (!is_file($dbFile)) return null;
  $raw = (string)@file_get_contents($dbFile);
  $data = json_decode($raw, true);
  return (is_array($data) && isset($data['users']) && is_array($data['users'])) ? $data : null;
}

function _lhSaveRawDb(string $dbFile, array $data): int {
  $json = json_encode($data, JSON_UNESCAPED_UNICODE);
  if ($json === false) return 0;
  $tmpFile = $dbFile . '.tmp.' . getmypid() . '.' . mt_rand(1000, 9999);
  if (@file_put_contents($tmpFile, $json, LOCK_EX) !== false) {
    @rename($tmpFile, $dbFile);
  } else {
    @file_put_contents($dbFile, $json, LOCK_EX);
  }
  clearstatcache(true, $dbFile);
  return is_file($dbFile) ? (int)@filemtime($dbFile) : time();
}

function _lhB64uEnc(string $s): string {
  return rtrim(strtr(base64_encode($s), '+/', '-_'), '=');
}

function _lhB64uDec(string $s): string {
  $pad = strlen($s) % 4;
  if ($pad > 0) $s .= str_repeat('=', 4 - $pad);
  return (string)base64_decode(strtr($s, '-_', '+/'));
}

function _lhSignToken(array $payload, int $ttl, string $secret): array {
  $full = $payload;
  $full['exp'] = time() + max(1, $ttl);
  $body = _lhB64uEnc((string)json_encode($full, JSON_UNESCAPED_UNICODE));
  $sig = hash_hmac('sha256', $body, $secret . '|token');
  return ['token' => $body . '.' . $sig, 'payload' => $full];
}

function _lhVerifyToken(string $tok, string $secret, array $users): ?array {
  if ($tok === '' || strpos($tok, '.') === false) return null;
  [$body, $sig] = explode('.', $tok, 2);
  $expected = hash_hmac('sha256', $body, $secret . '|token');
  if (!hash_equals($expected, $sig)) return null;
  $p = json_decode(_lhB64uDec($body), true);
  if (!is_array($p) || empty($p['sub']) || empty($p['exp'])) return null;
  if ((int)$p['exp'] <= time()) return null;
  foreach ($users as $u) {
    if (($u['id'] ?? '') === $p['sub']) {
      if (!empty($u['locked'])) return null;
      $uv = isset($u['tokenVersion']) ? (int)$u['tokenVersion'] : 1;
      $pv = isset($p['v']) ? (int)$p['v'] : 1;
      if ($uv !== $pv) return null;
      return ['user' => $u, 'payload' => $p];
    }
  }
  return null;
}

define('LH_MASKED_TAG', 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');

function _lhMaskHash(string $h): string {
  if (strpos($h, '$argon2id$') !== 0) return $h;
  return (string)preg_replace('/^(\$argon2id\$v=19\$m=\d+,t=\d+,p=\d+\$[A-Za-z0-9+\/]+)\$[A-Za-z0-9+\/]+$/', '$1$' . LH_MASKED_TAG, $h);
}

function _lhIsMaskedHash(string $h): bool {
  return substr($h, -strlen('$' . LH_MASKED_TAG)) === '$' . LH_MASKED_TAG;
}

function _lhFilterDataForViewer(array $data, ?array $viewer): array {
  $role = $viewer['role'] ?? 'guest';
  $uid = $viewer['id'] ?? '';

  // Luôn ẩn mã băm mật khẩu thật của mọi tài khoản (chỉ giữ tham số & salt để trình duyệt tính Argon2id)
  if (isset($data['users']) && is_array($data['users'])) {
    foreach ($data['users'] as &$u) {
      if (isset($u['passwordHash']) && is_string($u['passwordHash'])) {
        $u['passwordHash'] = _lhMaskHash($u['passwordHash']);
      }
      if ($role === 'guest') {
        unset($u['phone'], $u['dob'], $u['hometown']);
      } elseif ($role === 'student' && ($u['id'] ?? '') !== $uid && ($u['role'] ?? '') === 'student') {
        unset($u['phone'], $u['dob'], $u['hometown'], $u['email']);
      }
    }
    unset($u);
  }

  // Khách chưa đăng nhập: chỉ nhận danh mục trường/lớp/tin tức cơ bản, ẩn toàn bộ dữ liệu nhạy cảm
  if ($role === 'guest') {
    $data['alerts'] = [];
    $data['audit'] = [];
    $data['aiLogs'] = [];
    $data['reports'] = [];
    $data['records'] = [];
    $data['counseling'] = [];
    $data['teacherChat'] = [];
    $data['schoolChat'] = [
      'messages' => [],
      'locked' => (bool)($data['schoolChat']['locked'] ?? false),
      'clearedDefaultV1' => true,
    ];
    $data['moods'] = [];
    $data['surveyResponses'] = [];
    $data['scamChecks'] = [];
    $data['feedback'] = [];
    $data['notifications'] = [];
    $data['unlockRequests'] = [];
    $data['aiConfig'] = ['provider' => 'off'];
    if (isset($data['settings']['apiPin'])) {
      unset($data['settings']['apiPin']);
    }
    return $data;
  }

  // Học sinh: chỉ nhận dữ liệu của chính mình và thông tin chung toàn trường
  if ($role === 'student') {
    $data['alerts'] = [];
    $data['audit'] = [];
    $data['unlockRequests'] = [];
    $data['aiConfig'] = ['provider' => (string)($data['aiConfig']['provider'] ?? 'off')];
    $data['aiLogs'] = array_values(array_filter($data['aiLogs'] ?? [], fn($x) => ($x['userId'] ?? '') === $uid));
    $data['reports'] = array_values(array_filter($data['reports'] ?? [], fn($x) => ($x['reporterId'] ?? '') === $uid));
    $data['records'] = array_values(array_filter($data['records'] ?? [], fn($x) => ($x['studentId'] ?? '') === $uid));
    $data['counseling'] = array_values(array_filter($data['counseling'] ?? [], fn($x) => ($x['studentId'] ?? '') === $uid));
    $data['teacherChat'] = array_values(array_filter($data['teacherChat'] ?? [], fn($x) => ($x['studentId'] ?? '') === $uid));
    $data['moods'] = array_values(array_filter($data['moods'] ?? [], fn($x) => ($x['userId'] ?? '') === $uid));
    $data['surveyResponses'] = array_values(array_filter($data['surveyResponses'] ?? [], fn($x) => ($x['userId'] ?? '') === $uid));
    $data['scamChecks'] = array_values(array_filter($data['scamChecks'] ?? [], fn($x) => ($x['userId'] ?? '') === $uid));
    $data['feedback'] = array_values(array_filter($data['feedback'] ?? [], fn($x) => ($x['userId'] ?? '') === $uid));
    if (isset($data['settings']['apiPin'])) {
      unset($data['settings']['apiPin']);
    }
    return $data;
  }

  // Giáo viên & Ban Giám hiệu: nhận dữ liệu vận hành đầy đủ (nhưng passwordHash vẫn đã được che tag thật)
  return $data;
}

function _lhMergeListById(array $orig, array $inc, bool $prependNew = true): array {
  $map = [];
  $order = [];
  foreach ($orig as $idx => $item) {
    $id = is_array($item) && isset($item['id']) ? (string)$item['id'] : ('__idx_' . $idx);
    $map[$id] = $item;
    $order[] = $id;
  }
  $newIds = [];
  foreach ($inc as $item) {
    if (!is_array($item) || !isset($item['id'])) continue;
    $id = (string)$item['id'];
    if (!array_key_exists($id, $map)) {
      $newIds[] = $id;
    }
    $map[$id] = $item;
  }
  $finalIds = $prependNew ? array_merge($newIds, $order) : array_merge($order, $newIds);
  $out = [];
  foreach ($finalIds as $id) {
    if (isset($map[$id])) $out[] = $map[$id];
  }
  return $out;
}

function _lhMergeSave(array $currentDb, array $incoming, ?array $viewer): array {
  $role = $viewer['role'] ?? 'guest';
  $uid = $viewer['id'] ?? '';

  $origUsers = [];
  foreach ($currentDb['users'] ?? [] as $u) {
    if (isset($u['id'])) $origUsers[(string)$u['id']] = $u;
  }

  // 1. Khách chưa đăng nhập: chỉ được cập nhật bộ đếm sai mật khẩu / khóa tự động và gửi yêu cầu mở khóa
  if ($role === 'guest') {
    if (isset($incoming['users']) && is_array($incoming['users'])) {
      $incMap = [];
      foreach ($incoming['users'] as $iu) {
        if (isset($iu['id'])) $incMap[(string)$iu['id']] = $iu;
      }
      foreach ($currentDb['users'] as &$cu) {
        $id = (string)($cu['id'] ?? '');
        if (!isset($incMap[$id])) continue;
        $iu = $incMap[$id];
        if (isset($iu['failedLoginCount'])) $cu['failedLoginCount'] = (int)$iu['failedLoginCount'];
        if (!empty($iu['locked']) && empty($cu['locked'])) {
          $cu['locked'] = true;
          $cu['lockReason'] = $iu['lockReason'] ?? 'auto';
          $cu['lockedAt'] = $iu['lockedAt'] ?? date('c');
        }
        if (isset($iu['lastLogin']) && $iu['lastLogin'] !== ($cu['lastLogin'] ?? null)) {
          $cu['lastLogin'] = $iu['lastLogin'];
          $cu['failedLoginCount'] = 0;
        }
      }
      unset($cu);
    }
    foreach (['unlockRequests', 'audit', 'notifications'] as $k) {
      if (isset($incoming[$k]) && is_array($incoming[$k])) {
        $currentDb[$k] = _lhMergeListById($currentDb[$k] ?? [], $incoming[$k], true);
      }
    }
    return $currentDb;
  }

  // 2. Học sinh đang đăng nhập: chỉ được cập nhật hồ sơ của chính mình & gộp các bản ghi mới theo ID
  if ($role === 'student') {
    if (isset($incoming['users']) && is_array($incoming['users'])) {
      foreach ($incoming['users'] as $iu) {
        if (($iu['id'] ?? '') === $uid && isset($origUsers[$uid])) {
          $orig = $origUsers[$uid];
          $iu['role'] = $orig['role'];
          $iu['id'] = $orig['id'];
          $iu['locked'] = $orig['locked'] ?? false;
          if (empty($iu['passwordHash']) || _lhIsMaskedHash((string)$iu['passwordHash'])) {
            $iu['passwordHash'] = $orig['passwordHash'];
          }
          foreach ($currentDb['users'] as &$cu) {
            if (($cu['id'] ?? '') === $uid) {
              $cu = array_merge($orig, $iu);
              break;
            }
          }
          unset($cu);
          break;
        }
      }
    }
    $mergeFront = ['reports', 'counseling', 'teacherChat', 'aiLogs', 'moods', 'surveyResponses', 'quizAttempts', 'scamChecks', 'feedback', 'notifications', 'alerts', 'audit', 'faceKeys', 'unlockRequests'];
    foreach ($mergeFront as $k) {
      if (isset($incoming[$k]) && is_array($incoming[$k])) {
        $currentDb[$k] = _lhMergeListById($currentDb[$k] ?? [], $incoming[$k], true);
      }
    }
    if (isset($incoming['schoolChat']['messages']) && is_array($incoming['schoolChat']['messages'])) {
      $currentDb['schoolChat']['messages'] = _lhMergeListById($currentDb['schoolChat']['messages'] ?? [], $incoming['schoolChat']['messages'], false);
    }
    return $currentDb;
  }

  // 3. Giáo viên / Ban Giám hiệu: có toàn quyền cập nhật nhưng bảo toàn passwordHash thật trên đĩa
  if (isset($incoming['users']) && is_array($incoming['users'])) {
    foreach ($incoming['users'] as &$iu) {
      $id = (string)($iu['id'] ?? '');
      if (isset($origUsers[$id])) {
        $orig = $origUsers[$id];
        if (empty($iu['passwordHash']) || _lhIsMaskedHash((string)$iu['passwordHash'])) {
          $iu['passwordHash'] = $orig['passwordHash'];
        }
      }
    }
    unset($iu);
  }
  return $incoming;
}

// ============================================================================
//  XỬ LÝ CÁC HÀNH ĐỘNG TRONG GÓI NHỊ PHÂN ĐÃ MÃ HÓA
// ============================================================================
$dbData = _lhLoadRawDb($dbFile);
$verified = ($dbData && $reqToken !== '') ? _lhVerifyToken($reqToken, $secret, $dbData['users']) : null;
$viewer = $verified ? $verified['user'] : null;

// A. Xác thực mật khẩu Argon2id trên máy chủ (so khớp tag thật trong db-live.json)
if ($action === 'verify-pw') {
  $salt = trim((string)($req['salt'] ?? ''));
  $tag = trim((string)($req['tag'] ?? ''));
  if (!$dbData || $salt === '' || $tag === '') {
    _lhSendPkt(['ok' => true, 'valid' => false], $pktKey);
  }
  $needle = '$' . $salt . '$';
  foreach ($dbData['users'] as $u) {
    $h = (string)($u['passwordHash'] ?? '');
    $pos = strpos($h, $needle);
    if ($pos !== false) {
      $realTag = substr($h, $pos + strlen($needle));
      if ($realTag !== '' && hash_equals($realTag, $tag)) {
        $ts = time();
        $uid = (string)$u['id'];
        $sig = hash_hmac('sha256', $uid . '|' . $ts, $secret . '|pwproof');
        _lhSendPkt(['ok' => true, 'valid' => true, 'userId' => $uid, 'proof' => $uid . '.' . $ts . '.' . $sig], $pktKey);
      }
    }
  }
  _lhSendPkt(['ok' => true, 'valid' => false], $pktKey);
}

// B. Ký token phiên đăng nhập trên máy chủ (bắt buộc có bằng chứng mật khẩu đúng hoặc token cũ hợp lệ)
if ($action === 'sign-token') {
  $payload = isset($req['payload']) && is_array($req['payload']) ? $req['payload'] : [];
  $ttl = isset($req['ttl']) ? (int)$req['ttl'] : 86400;
  $proof = trim((string)($req['proof'] ?? ''));
  $sub = (string)($payload['sub'] ?? '');
  if (!$dbData || $sub === '') {
    _lhSendPkt(['ok' => false, 'error' => 'Unauthorized'], $pktKey, 403);
  }
  $targetUser = null;
  foreach ($dbData['users'] as $u) {
    if (($u['id'] ?? '') === $sub) { $targetUser = $u; break; }
  }
  if (!$targetUser || !empty($targetUser['locked'])) {
    _lhSendPkt(['ok' => false, 'error' => 'Unauthorized'], $pktKey, 403);
  }
  $authorized = false;
  if ($proof !== '' && substr_count($proof, '.') === 2) {
    [$pUid, $pTs, $pSig] = explode('.', $proof, 3);
    if ($pUid === $sub && abs(time() - (int)$pTs) <= 120) {
      $expected = hash_hmac('sha256', $pUid . '|' . $pTs, $secret . '|pwproof');
      if (hash_equals($expected, $pSig)) $authorized = true;
    }
  }
  if (!$authorized && $viewer && ($viewer['id'] ?? '') === $sub) {
    $authorized = true;
  }
  if (!$authorized && !empty($req['faceHash'])) {
    $fh = (string)$req['faceHash'];
    foreach ($dbData['faceKeys'] ?? [] as $fk) {
      if (($fk['userId'] ?? '') === $sub && hash_equals((string)($fk['hash'] ?? ''), $fh)) {
        $authorized = true;
        break;
      }
    }
  }
  if (!$authorized) {
    _lhSendPkt(['ok' => false, 'error' => 'Unauthorized'], $pktKey, 403);
  }
  // Luôn lấy role từ cơ sở dữ liệu gốc trên máy chủ (chống giả mạo quyền admin)
  $payload['role'] = $targetUser['role'];
  $payload['v'] = isset($targetUser['tokenVersion']) ? (int)$targetUser['tokenVersion'] : 1;
  $signed = _lhSignToken($payload, $ttl, $secret);
  _lhSendPkt(['ok' => true, 'token' => $signed['token'], 'payload' => $signed['payload']], $pktKey);
}

// C. Kiểm tra nhanh token phiên đăng nhập
if ($action === 'verify-token') {
  if ($verified) {
    _lhSendPkt(['ok' => true, 'valid' => true, 'payload' => $verified['payload']], $pktKey);
  }
  _lhSendPkt(['ok' => true, 'valid' => false], $pktKey);
}

// D. Kiểm tra thay đổi dữ liệu định kỳ (poll)
if ($action === 'poll') {
  clearstatcache(true, $dbFile);
  $mtime = is_file($dbFile) ? (int)@filemtime($dbFile) : 0;
  $since = isset($req['mtime']) ? (int)$req['mtime'] : 0;
  if ($mtime > $since && $dbData) {
    $filtered = _lhFilterDataForViewer($dbData, $viewer);
    _lhSendPkt(['ok' => true, 'changed' => true, 'mtime' => $mtime, 'data' => $filtered], $pktKey);
  }
  _lhSendPkt(['ok' => true, 'changed' => false, 'mtime' => $mtime], $pktKey);
}

// E. Tải tệp đính kèm lên máy chủ
if ($action === 'upload') {
  $dataUrl = (string)($req['data'] ?? '');
  $origName = (string)($req['name'] ?? 'file.jpg');
  if (!preg_match('/^data:([^;]+);base64,(.+)$/s', $dataUrl, $m)) {
    _lhSendPkt(['ok' => false, 'error' => 'Dữ liệu tệp tải lên không hợp lệ.'], $pktKey, 400);
  }
  $mime = strtolower(trim($m[1]));
  $bin = base64_decode($m[2], true);
  if ($bin === false || strlen($bin) > 25 * 1024 * 1024) {
    _lhSendPkt(['ok' => false, 'error' => 'Tệp vượt quá giới hạn 25 MB.'], $pktKey, 413);
  }
  $extMap = [
    'image/jpeg' => 'jpg', 'image/jpg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif',
    'application/pdf' => 'pdf', 'video/mp4' => 'mp4', 'video/webm' => 'webm',
    'audio/mpeg' => 'mp3', 'audio/wav' => 'wav', 'audio/mp4' => 'm4a', 'audio/ogg' => 'ogg',
  ];
  $ext = $extMap[$mime] ?? strtolower(pathinfo($origName, PATHINFO_EXTENSION));
  $allowed = ['jpg','jpeg','png','webp','gif','pdf','mp4','webm','mp3','wav','m4a','ogg','doc','docx','xls','xlsx','ppt','pptx','txt','zip'];
  if (!in_array($ext, $allowed, true)) {
    $ext = 'bin';
  }
  $filename = 'upload-' . base_convert((string)time(), 10, 36) . '-' . substr(bin2hex(random_bytes(4)), 0, 8) . '.' . $ext;
  $dest = $uploadDir . '/' . $filename;
  if (@file_put_contents($dest, $bin) === false) {
    _lhSendPkt(['ok' => false, 'error' => 'Không thể ghi tệp lên máy chủ.'], $pktKey, 500);
  }
  _lhSendPkt(['ok' => true, 'url' => 'uploads/' . $filename, 'size' => strlen($bin)], $pktKey);
}

// F. Lưu dữ liệu về máy chủ (có kiểm tra phân quyền & bảo toàn passwordHash thật)
if ($action === 'save') {
  $incoming = isset($req['data']) && is_array($req['data']) ? $req['data'] : null;
  if (!is_array($incoming) || !isset($incoming['users']) || !is_array($incoming['users'])) {
    _lhSendPkt(['ok' => false, 'error' => 'Cấu trúc dữ liệu không hợp lệ.'], $pktKey, 400);
  }
  $merged = $dbData ? _lhMergeSave($dbData, $incoming, $viewer) : $incoming;
  $mtime = _lhSaveRawDb($dbFile, $merged);
  if (!$mtime) {
    _lhSendPkt(['ok' => false, 'error' => 'Không thể lưu dữ liệu.'], $pktKey, 500);
  }
  _lhSendPkt(['ok' => true, 'mtime' => $mtime], $pktKey);
}

// G. Mặc định: action = load (lọc dữ liệu theo quyền của token hiện tại)
if ($dbData) {
  clearstatcache(true, $dbFile);
  $mtime = (int)@filemtime($dbFile);
  $filtered = _lhFilterDataForViewer($dbData, $viewer);
  _lhSendPkt([
    'ok' => true,
    'mtime' => $mtime,
    'tokenValid' => $verified !== null,
    'tokenPayload' => $verified ? $verified['payload'] : null,
    'viewerRole' => $viewer['role'] ?? 'guest',
    'data' => $filtered,
  ], $pktKey);
}

_lhSendPkt(['ok' => false, 'empty' => true], $pktKey);
