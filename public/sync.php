<?php
// ============================================================================
//  CẦU NỐI ĐỒNG BỘ DỮ LIỆU & TỆP ĐÍNH KÈM TRÊN HOSTING CPANEL (LITESPEED / PHP)
//  Tự động kích hoạt khi hosting chạy qua LiteSpeed/Apache mà chưa bật daemon Node.js
// ============================================================================
error_reporting(0);
ini_set('display_errors', '0');
ini_set('memory_limit', '256M');

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

// Tự động dọn thư mục thừa public_html/public_html (bị kẹt quyền 0555 từ lần giải nén cũ)
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

$action = $_GET['action'] ?? ($_SERVER['REQUEST_METHOD'] === 'POST' ? 'save' : 'load');

if ($action === 'deploy-zip' && $_SERVER['REQUEST_METHOD'] === 'POST') {
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
      $za->extractTo(__DIR__);
      $za->close();
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

if ($action === 'poll') {
  clearstatcache(true, $dbFile);
  $mtime = is_file($dbFile) ? (int)@filemtime($dbFile) : 0;
  $since = isset($_GET['mtime']) ? (int)$_GET['mtime'] : 0;
  if ($mtime > $since && is_file($dbFile)) {
    $raw = @file_get_contents($dbFile);
    $data = json_decode((string)$raw, true);
    if (is_array($data)) {
      echo json_encode(['ok' => true, 'changed' => true, 'mtime' => $mtime, 'data' => $data], JSON_UNESCAPED_UNICODE);
      exit;
    }
  }
  echo json_encode(['ok' => true, 'changed' => false, 'mtime' => $mtime]);
  exit;
}

if ($action === 'upload' && $_SERVER['REQUEST_METHOD'] === 'POST') {
  $body = json_decode((string)file_get_contents('php://input'), true);
  $dataUrl = (string)($body['data'] ?? '');
  $origName = (string)($body['name'] ?? 'file.jpg');
  if (!preg_match('/^data:([^;]+);base64,(.+)$/s', $dataUrl, $m)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Dữ liệu tệp tải lên không hợp lệ.'], JSON_UNESCAPED_UNICODE);
    exit;
  }
  $mime = strtolower(trim($m[1]));
  $bin = base64_decode($m[2], true);
  if ($bin === false || strlen($bin) > 25 * 1024 * 1024) {
    http_response_code(413);
    echo json_encode(['ok' => false, 'error' => 'Tệp vượt quá giới hạn 25 MB.'], JSON_UNESCAPED_UNICODE);
    exit;
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
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Không thể ghi tệp lên máy chủ.'], JSON_UNESCAPED_UNICODE);
    exit;
  }
  echo json_encode(['ok' => true, 'url' => 'uploads/' . $filename, 'size' => strlen($bin)], JSON_UNESCAPED_UNICODE);
  exit;
}

if ($action === 'save' && $_SERVER['REQUEST_METHOD'] === 'POST') {
  $body = json_decode((string)file_get_contents('php://input'), true);
  $data = isset($body['data']) && is_array($body['data']) ? $body['data'] : $body;
  if (!is_array($data) || !isset($data['users']) || !is_array($data['users'])) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Cấu trúc dữ liệu không hợp lệ.'], JSON_UNESCAPED_UNICODE);
    exit;
  }
  $json = json_encode($data, JSON_UNESCAPED_UNICODE);
  if ($json === false) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Lỗi mã hóa JSON.'], JSON_UNESCAPED_UNICODE);
    exit;
  }
  $tmpFile = $dbFile . '.tmp.' . getmypid() . '.' . mt_rand(1000, 9999);
  if (@file_put_contents($tmpFile, $json, LOCK_EX) !== false) {
    @rename($tmpFile, $dbFile);
  } else {
    @file_put_contents($dbFile, $json, LOCK_EX);
  }
  clearstatcache(true, $dbFile);
  $mtime = is_file($dbFile) ? (int)@filemtime($dbFile) : time();
  echo json_encode(['ok' => true, 'mtime' => $mtime]);
  exit;
}

// Mặc định: action = load
if (is_file($dbFile)) {
  clearstatcache(true, $dbFile);
  $mtime = (int)@filemtime($dbFile);
  $raw = (string)@file_get_contents($dbFile);
  $data = json_decode($raw, true);
  if (is_array($data) && isset($data['users'])) {
    echo json_encode(['ok' => true, 'mtime' => $mtime, 'secret' => $secret, 'data' => $data], JSON_UNESCAPED_UNICODE);
    exit;
  }
}

echo json_encode(['ok' => false, 'empty' => true, 'secret' => $secret]);
