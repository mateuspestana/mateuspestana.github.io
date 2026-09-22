"""Checks code-cell line numbers and cell-relative Python tracebacks."""

import argparse

from playwright.sync_api import sync_playwright


def set_code(page, code):
    page.locator(".CodeMirror").first.evaluate(
        "(editor, value) => editor.CodeMirror.setValue(value)", code
    )


def run_code(page, code, error_name):
    set_code(page, code)
    page.get_by_role("button", name="Executar").first.click()
    output = page.locator(".error-output").first
    page.wait_for_function(
        "error_name => document.querySelector('.error-output')?.textContent.includes(error_name)",
        arg=error_name,
        timeout=180_000,
    )
    return output.inner_text()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", required=True)
    args = parser.parse_args()

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(f"{args.base_url}/prova/", wait_until="networkidle")
        page.locator("#student-name").fill("Teste de Linha")
        page.locator("#student-id").fill("123456")
        page.get_by_role("button", name="Abrir caderno de prova").click()
        page.locator(".CodeMirror").first.wait_for()

        assert page.locator(".CodeMirror").count() == page.locator(".code-cell").count()
        set_code(page, "def mensagem():\n    return 'ok' + 2  # comentario")
        editor = page.locator(".CodeMirror").first
        assert editor.locator(".cm-def").count() == 1
        assert editor.locator(".cm-string").count() == 1
        assert editor.locator(".cm-number").count() == 1
        assert editor.locator(".cm-comment").count() == 1
        editor.evaluate("""editor => {
            const code = editor.CodeMirror;
            code.setValue("if True:\\npass");
            code.setCursor({line: 1, ch: 0});
            code.focus();
        }""")
        page.keyboard.press("Tab")
        assert editor.evaluate("editor => editor.CodeMirror.getValue()") == "if True:\n    pass"

        runtime_error = run_code(page, "primeira = 1\nvariavel_inexistente", "NameError")
        assert 'File "<celula>", line 2' in runtime_error
        assert "NameError" in runtime_error

        syntax_error = run_code(page, "primeira = 1\nif True print('erro')", "SyntaxError")
        assert 'File "<celula>", line 2' in syntax_error
        assert "SyntaxError" in syntax_error
        browser.close()


if __name__ == "__main__":
    main()
