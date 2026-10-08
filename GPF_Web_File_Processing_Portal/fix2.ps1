$p = 'd:\F Drive\GPF Soft\GPF_Web_File_Processing_Portal\src\components\InputFormTable.tsx'
$l = [System.IO.File]::ReadAllLines($p)

function Set-Lines($lines, $start, $count, $new) {
  $head = $lines[0..($start - 1)]
  $tail = $lines[($start + $count)..($lines.Length - 1)]
  $lines = @($head + $new + $tail)
  return $lines
}

# 1-based lines: row19 block 773..790
$l = Set-Lines $l 773 18 @(
  '              hint="উপজেলা আইডি খোলার সময় নিশ্চিত করা নাম স্থায়ীভাবে ফিক্সড"',
  '              lockCells={renderFixedCells()}',
  '            >',
  '                  <input',
  '                    type="text"',
  '                    value={formData.upazilaName}',
  '                    readOnly',
  '                    placeholder="যেমন: বিয়ানীবাজার"',
  '                    className="w-full max-w-sm rounded-lg px-3 py-1.5 border text-sm font-semibold focus:outline-hidden bg-slate-950 border-slate-700 text-white placeholder-slate-500"',
  '                  />',
  '            </FormRow>'
)
# row18: lines 731..734
$l = Set-Lines $l 731 4 @(
  "              lockCells={renderLockControls('ddoDesignation')}",
  '            >',
  '                  <div className="flex flex-wrap items-center gap-2">'
)
# row17: lines 709..712
$l = Set-Lines $l 709 4 @(
  "              lockCells={renderLockControls('ddoName')}",
  '            >',
  '                  <input',
  '                    type="text"'
)
[System.IO.File]::WriteAllLines($p, $l)
Write-Output 'ok'
