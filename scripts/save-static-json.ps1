$ErrorActionPreference = 'Stop'

$base = 'http://localhost:3000'
$out = Join-Path (Join-Path $PSScriptRoot '..') 'public'

if (-not (Test-Path -LiteralPath $out)) {
  New-Item -ItemType Directory -Path $out | Out-Null
}

Write-Host "Saving products.ru.json"
$prod = Invoke-WebRequest -UseBasicParsing -Uri "$base/api/products?locale=ru" -Headers @{ 'Accept'='application/json' }
$prod.Content | Set-Content -Path (Join-Path $out 'products.ru.json') -Encoding UTF8

# Known category slugs used in the UI grid
$slugs = @(
  'ognetushiteli',
  'rukava_i_pozharnaya_armatura',
  'pozharnaya_signalizatsiya_i_svetozvukovye_ustroystva',
  'pozharnye_shkafy',
  'usiliteli',
  'dinamiki_potolochnye',
  'furnitura_dlya_ognetushiteley',
  'siz',
  'sistemy_pozharotusheniya_sprinkler',
  'oborudovanie_kontrolya_dostupa',
  'zamki_i_aksessuary',
  'audiosistema_i_opoveschenie',
  'istochniki_pitaniya',
  'paneli_gsm_i_besprovodnye_sistemy_ipro',
  'kontrolnye_paneli_adresnye_pozharno_ohrannye',
  'sistemy_opovescheniya_o_pozhare_dsppa_abk',
  'metakom',
  'tsifral',
  'monitory_i_krepleniya',
  'videoregistratory_usiliteli_signala_haby',
  'oborudovanie_proizvodstva_npo_bolid_rossiya',
  'ballony'
)

foreach ($slug in $slugs) {
  $url = "$base/api/categories/$([uri]::EscapeDataString($slug))?locale=ru"
  $dest = Join-Path $out ("categories.$slug.ru.json")
  Write-Host "Saving '$dest' from '$url'"
  try {
    $resp = Invoke-WebRequest -UseBasicParsing -Uri $url -Headers @{ 'Accept'='application/json' }
    $resp.Content | Set-Content -Path $dest -Encoding UTF8
  } catch {
    Write-Warning ("Failed $($slug): " + $_.Exception.Message)
  }
}
