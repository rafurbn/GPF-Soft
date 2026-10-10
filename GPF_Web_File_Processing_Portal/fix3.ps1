$p = 'd:\F Drive\GPF Soft\GPF_Web_File_Processing_Portal\src\components\InputFormTable.tsx'
$l = [System.Collections.Generic.List[string]]([System.IO.File]::ReadAllLines($p))

# Fix row 6 block (0-based 422..431)
$l.RemoveRange(422, 10)
$row6 = @(
  '            <FormRow',
  '              index="৬"',
  '              label="বিদ্যালয়ের নাম"',
  '              lockCells={renderEmptyLockCells()}',
  '            >',
  '                  <input',
  '                    type="text"',
  '                    value={formData.schoolName}',
  '                    onChange={(e) => handleChange(''schoolName'', e.target.value)}',
  '                    placeholder="যেমন: কুড়ার বাজার সরকারি প্রাথমিক বিদ্যালয়"',
  '                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 text-sm font-semibold"',
  '                  />',
  '            </FormRow>'
)
for ($k = 0; $k -lt $row6.Count; $k++) { $l.Insert(422 + $k, $row6[$k]) }

# Now clean leftover artifacts
for ($i = $l.Count - 1; $i -ge 0; $i--) {
  if ($l[$i].Trim() -eq 'lockCells={</td>}') {
    $l[$i] = '              lockCells={renderEmptyLockCells()}'
    $l.RemoveAt($i + 2)
    $l.RemoveAt($i + 1)
  }
}
[System.IO.File]::WriteAllLines($p, $l)
Write-Output 'ok'
