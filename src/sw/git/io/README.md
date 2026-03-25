# sw/git/io

File I/O operations on the local git working tree in IndexedDB. All operations are metered via `recordOp` for performance tracking.

## Key Exports

- `readRepoFile` -- read a UTF-8 file from the working tree
- `readBinaryFile` -- read a binary file as Uint8Array
- `writeRepoFile` -- write UTF-8 content to the working tree
- `writeBinaryFile` -- write binary content to the working tree
- `deleteGitFile` -- delete a file and remove it from the git index
- `listFiles` -- list files under a directory path
- `ensureDir` -- recursively create directory structure
- `effectFs` -- Effect-wrapped filesystem operations
