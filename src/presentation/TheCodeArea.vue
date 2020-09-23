<template>
    <div :id="editorId" class="code-area" ></div>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';
import { StatefulVue } from './StatefulVue';
import ace from 'ace-builds';
import 'ace-builds/webpack-resolver';
import { CodeBuilder } from '@/application/State/Code/Generation/CodeBuilder';
import { ICodeChangedEvent } from '@/application/State/Code/Event/ICodeChangedEvent';
import { IScript } from '@/domain/IScript';

const NothingChosenCode =
  new CodeBuilder()
    .appendCommentLine('privacy.sexy — 🔐 Enforce privacy & security best-practices on Windows')
    .appendLine()
    .appendCommentLine('-- 🤔 How to use')
    .appendCommentLine(' 📙 Start by exploring different categories and choosing different tweaks.')
    .appendCommentLine(' 📙 You can select "Recommended" on the top to select "safer" tweaks. Always double check!')
    .appendCommentLine(' 📙 After you choose any tweak, you can download or copy to execute your script.')
    .appendCommentLine(' 📙 Come back regularly to apply latest version for stronger privacy and security.')
    .appendLine()
    .appendCommentLine('-- 🧐 Why privacy.sexy')
    .appendCommentLine(' ✔️ Rich tweak pool to harden security & privacy of the OS and other software on it.')
    .appendCommentLine(' ✔️ No need to run any compiled software on your system, just run the generated scripts.')
    .appendCommentLine(' ✔️ Have full visibility into what the tweaks do as you enable them.')
    .appendCommentLine(' ✔️ Open-source and free (both free as in beer and free as in speech).')
    .toString();

@Component
export default class TheCodeArea extends StatefulVue {
  public readonly editorId = 'codeEditor';

  private editor!: ace.Ace.Editor;
  private currentMarkerId?: number;

  @Prop() private theme!: string;

  public async mounted() {
    this.editor = initializeEditor(this.theme, this.editorId);
    const state = await this.getCurrentStateAsync();
    this.editor.setValue(state.code.current || NothingChosenCode, 1);
    state.code.changed.on((code) => this.updateCode(code));
  }

  private updateCode(event: ICodeChangedEvent) {
    this.removeCurrentHighlighting();
    if (event.isEmpty()) {
      this.editor.setValue(NothingChosenCode, 1);
      return;
    }
    this.editor.setValue(event.code, 1);

    if (event.addedScripts && event.addedScripts.length) {
      this.reactToChanges(event, event.addedScripts);
    } else if (event.changedScripts && event.changedScripts.length) {
      this.reactToChanges(event, event.changedScripts);
    }
  }

  private reactToChanges(event: ICodeChangedEvent, scripts: ReadonlyArray<IScript>) {
      const positions = scripts
        .map((script) => event.getScriptPositionInCode(script));
      const start = Math.min(
        ...positions.map((position) => position.startLine),
      );
      const end = Math.max(
        ...positions.map((position) => position.endLine),
      );
      this.scrollToLine(end + 2);
      this.highlight(start, end);
  }

  private highlight(startRow: number, endRow: number) {
    const AceRange = ace.require('ace/range').Range;
    this.currentMarkerId = this.editor.session.addMarker(
        new AceRange(startRow, 0, endRow, 0), 'code-area__highlight', 'fullLine',
    );
  }

  private scrollToLine(row: number) {
    const column = this.editor.session.getLine(row).length;
    this.editor.gotoLine(row, column, true);
  }

  private removeCurrentHighlighting() {
    if (!this.currentMarkerId) {
      return;
    }
    this.editor.session.removeMarker(this.currentMarkerId);
    this.currentMarkerId = undefined;
  }
}

function initializeEditor(theme: string, editorId: string): ace.Ace.Editor {
  const lang = 'batchfile';
  theme = theme || 'github';
  const editor = ace.edit(editorId);
  editor.getSession().setMode(`ace/mode/${lang}`);
  editor.setTheme(`ace/theme/${theme}`);
  editor.setReadOnly(true);
  editor.setAutoScrollEditorIntoView(true);
  editor.getSession().setUseWrapMode(true); // So code is readable on mobile
  return editor;
}

</script>

<style lang="scss">
@import "@/presentation/styles/colors.scss";
.code-area {
    width: 100%;
    max-height: 1000px;
    min-height: 200px;
    &__highlight {
      background-color:$accent;
      opacity: 0.2; // having procent fails in production (minified) build
      position:absolute;
    }
}
</style>
