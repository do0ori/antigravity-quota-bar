# Privacy Policy for Antigravity Group Quota Bar

## Data Collection & Storage
- **Zero External Transmission**: This extension communicates exclusively with the local Antigravity Language Server running on `127.0.0.1`.
- **No Analytics or Telemetry**: We do not collect, store, or transmit any user metrics, tokens, personal data, or code content to external servers.
- **Local Memory Processing**: Quota information fetched from the local language server is processed entirely in-memory and discarded upon closing the editor.

## Security
- **Local CSRF Authentication**: CSRF tokens are read strictly from local Win32 process flags to authenticate local gRPC-Web requests. Tokens are never logged or exported.
