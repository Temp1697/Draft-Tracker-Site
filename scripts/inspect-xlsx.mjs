import XLSX from 'xlsx'
import { readFileSync } from 'fs'

const buf = readFileSync('./Draft Model v1 3-27-26.xlsx')
const wb = XLSX.read(buf, { type: 'buffer' })

console.log('Sheet names:', wb.SheetNames)
console.log('---')

for (const name of wb.SheetNames) {
  const ws = wb.Sheets[name]
  const data = XLSX.utils.sheet_to_json(ws, { header: 1 })
  console.log(`\n=== ${name} ===`)
  console.log(`Rows: ${data.length}`)
  if (data.length > 0) {
    console.log('Headers:', JSON.stringify(data[0]))
  }
  if (data.length > 1) {
    console.log('First row:', JSON.stringify(data[1]))
  }
}
