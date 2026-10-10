$p = 'd:\F Drive\GPF Soft\GPF_Web_File_Processing_Portal\src\components\InputFormTable.tsx'
$l = [System.Collections.Generic.List[string]]([System.IO.File]::ReadAllLines($p))

$tdLine = '                <td className="bg-[#080d1e] p-2 sm:p-2.5 border-r border-slate-800">'
for ($i = $l.Count - 1; $i -ge 0; $i--) {
  if ($l[$i] -eq $tdLine -and $l[$i - 1] -match 'lockCells=\{') {
    $l[$i] = '            >'
    # dedent until </FormRow>
    for ($j = $i + 1; $j -lt $l.Count; $j++) {
      if ($l[$j].Trim() -eq '</FormRow>') { break }
      if ($l[$j].StartsWith('  ')) { $l[$j] = $l[$j].Substring(2) }
    }
  }
}

# Add missing hints for rows 13-16
$hints = @{
  '১৩' = 'হ্যাঁ/না/প্রযোজ্য নয়'
  '১৪' = 'হ্যাঁ/না/প্রযোজ্য নয়'
  '১৫' = 'প্রযোজ্য নয়/মাস ও সন এন্ট্রির অপশন'
  '১৬' = 'প্রযোজ্য নয়/রাইটিং অপশন'
}
for ($i = 0; $i -lt $l.Count; $i++) {
  if ($l[$i] -match '^\s+index="(১৩|১৪|১৫|১৬)"$') {
    $k = $Matches[1]
    $l.Insert($i + 2, "              hint=`"$($hints[$k])`"")
    $i += 2
  }
}

[System.IO.File]::WriteAllLines($p, $l)
Write-Output 'ok'
