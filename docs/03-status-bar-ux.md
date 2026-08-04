# Status Bar UX Specification

## 상태바 표기 규칙

### Status Bar Format (5-Hour Limit % Only)
`$(sparkle) 78% │ $(hubot) 0%`

- **Provider Icons**:
  - `$(sparkle)`: Gemini Models (5-Hour Limit %)
  - `$(hubot)`: Claude & GPT Models (5-Hour Limit %)
- **상태바 미니멀 지향**: 복잡한 주간/5시간 텍스트 중첩을 지양하고 5시간 잔여 쿼터 %만 직관적으로 표기합니다.

## Hover HTML Table Tooltip (Pixel-Perfect Alignment)

```html
<h3>✨ Gemini Models</h3>
<table>
  <tr>
    <td width="110"><b>Weekly Limit</b></td>
    <td><img src="data:image/svg+xml;..." align="center" /></td>
    <td width="40" align="right"><b>63%</b></td>
    <td><i>(Refreshes in 6d 12h)</i></td>
  </tr>
  <tr>
    <td width="110"><b>5-Hour Limit</b></td>
    <td><img src="data:image/svg+xml;..." align="center" /></td>
    <td width="40" align="right"><b>78%</b></td>
    <td><i>(Refreshes in 4h 2m)</i></td>
  </tr>
</table>

<h3>🤖 Claude and GPT models</h3>
<table>
  <tr>
    <td width="110"><b>Weekly Limit</b></td>
    <td><img src="data:image/svg+xml;..." align="center" /></td>
    <td width="40" align="right"><b>33%</b></td>
    <td><i>(Refreshes in 32m)</i></td>
  </tr>
  <tr>
    <td width="110"><b>5-Hour Limit</b></td>
    <td><img src="data:image/svg+xml;..." align="center" /></td>
    <td width="40" align="right"><b>0%</b></td>
    <td><i>(Refreshes in 32m)</i></td>
  </tr>
</table>
```
