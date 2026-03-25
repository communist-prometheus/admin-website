# sw/handlers/asset

Binary asset CRUD handlers for `/api/github/asset*` and `/api/github/commit` endpoints. Manages media files (images, video, audio) stored in content slug directories.

## Key Exports

- `routeAssetRequest` -- route dispatcher for asset and commit endpoints
- `handleAssetRead` -- read an asset as base64 (GET)
- `handleAssetWrite` -- write a base64-encoded asset (POST)
- `handleAssetDelete` -- delete an asset file (DELETE)
- `handleAssetList` -- list assets for a content item (GET)
