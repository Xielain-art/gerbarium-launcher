## 2024-05-01 - [Reverse Tabnabbing]
**Vulnerability:** Markdown links rendered by DOMPurify lacked `target="_blank"` and `rel="noopener noreferrer"`.
**Learning:** By default, DOMPurify sanitizes Markdown allowing `target="_blank"` on links but without enforcing the `rel="noopener noreferrer"` attribute, leading to potential reverse tabnabbing and window replacement in Electron renderer processes.
**Prevention:** Always use `DOMPurify.addHook('afterSanitizeAttributes')` to ensure external links safely receive `target="_blank"` and `rel="noopener noreferrer"`.
