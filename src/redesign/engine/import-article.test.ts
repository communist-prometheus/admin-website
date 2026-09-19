import { beforeEach, describe, expect, it, vi } from 'vitest';

const importFile = vi.fn();
const uploadBinaryViaApi = vi.fn();

vi.mock('@/components/MarkdownEditor/ImportDocs/import-file', () => ({
  importFile: (file: File) => importFile(file),
}));
vi.mock('./content.js', () => ({
  uploadBinaryViaApi: (path: string, base64: string, message: string) =>
    uploadBinaryViaApi(path, base64, message),
}));

import { importArticleFile } from './import-article.ts';

/**
 * The legacy client could pull an article out of a .docx, .html or .md file:
 * it converted the document to markdown, pulled the inline images out into
 * real asset files, and rewrote the markdown to point at them. The rebuilt
 * editor had no import at all, so that work had to be redone by hand.
 *
 * The conversion itself is the already-tested shared pipeline; what belongs
 * here is where the extracted images land — `<collection>/<slug>/assets/<name>`,
 * exactly the path the converted markdown references.
 */

const png = (name: string): File =>
  new File([new Uint8Array([1, 2, 3])], name, { type: 'image/png' });

beforeEach(() => {
  importFile.mockReset();
  uploadBinaryViaApi.mockReset();
  uploadBinaryViaApi.mockResolvedValue({ ok: true });
  importFile.mockResolvedValue({ markdown: '# Заголовок\n', images: [] });
});

describe('importing a document into an article', () => {
  it('returns the converted markdown', async () => {
    const result = await importArticleFile(png('a.docx'), 'blog', 'my-post');
    expect(result).toMatchObject({ ok: true, markdown: '# Заголовок\n' });
  });

  it('puts every extracted image where the markdown points', async () => {
    importFile.mockResolvedValue({
      markdown: '![](./assets/docx-img-1.png)\n',
      images: [png('docx-img-1.png'), png('docx-img-2.png')],
    });
    await importArticleFile(png('a.docx'), 'blog', 'my-post');
    const paths = uploadBinaryViaApi.mock.calls.map((c) => (c as [string])[0]);
    expect(paths).toEqual([
      'blog/my-post/assets/docx-img-1.png',
      'blog/my-post/assets/docx-img-2.png',
    ]);
  });

  it('uploads under the collection the material actually lives in', async () => {
    importFile.mockResolvedValue({ markdown: 'x', images: [png('html-img-1.png')] });
    await importArticleFile(png('a.html'), 'pages', 'o-nas');
    const [path] = uploadBinaryViaApi.mock.calls[0] as [string];
    expect(path).toBe('pages/o-nas/assets/html-img-1.png');
  });

  it('sends the image bytes base64-encoded, not the File', async () => {
    importFile.mockResolvedValue({ markdown: 'x', images: [png('i.png')] });
    await importArticleFile(png('a.docx'), 'blog', 'my-post');
    const [, base64] = uploadBinaryViaApi.mock.calls[0] as [string, string];
    expect(base64).toBe(btoa('\u0001\u0002\u0003'));
  });

  it('reports how many images it carried across', async () => {
    importFile.mockResolvedValue({ markdown: 'x', images: [png('a.png'), png('b.png')] });
    const result = await importArticleFile(png('a.docx'), 'blog', 'my-post');
    expect(result).toMatchObject({ ok: true, uploaded: 2 });
  });

  it('refuses a material with no address — the images would have nowhere to go', async () => {
    importFile.mockResolvedValue({ markdown: 'x', images: [png('a.png')] });
    const result = await importArticleFile(png('a.docx'), 'blog', '');
    expect(result.ok).toBe(false);
    expect(uploadBinaryViaApi).not.toHaveBeenCalled();
  });

  it('still imports text into an addressless material when it carries no images', async () => {
    importFile.mockResolvedValue({ markdown: '# Текст\n', images: [] });
    const result = await importArticleFile(png('a.md'), 'blog', '');
    expect(result).toMatchObject({ ok: true, markdown: '# Текст\n' });
  });

  it('surfaces an unsupported file type instead of throwing', async () => {
    importFile.mockRejectedValue(new Error('Unsupported file type. Pick a .docx, .html, or .md.'));
    const result = await importArticleFile(png('a.pages'), 'blog', 'my-post');
    expect(result.ok).toBe(false);
    expect(result.error).toContain('.docx');
  });

  it('stops and reports when an image fails to upload', async () => {
    importFile.mockResolvedValue({ markdown: 'x', images: [png('a.png'), png('b.png')] });
    uploadBinaryViaApi.mockResolvedValueOnce({ ok: false, error: 'отказано' });
    const result = await importArticleFile(png('a.docx'), 'blog', 'my-post');
    expect(result.ok).toBe(false);
    expect(result.error).toContain('отказано');
    expect(uploadBinaryViaApi).toHaveBeenCalledTimes(1);
  });
});
