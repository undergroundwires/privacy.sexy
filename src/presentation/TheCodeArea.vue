<template>
    <div :id="editorId" class="code-area" ></div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator';
import { StatefulVue, IApplicationState } from './StatefulVue';
import ace from 'ace-builds';
import 'ace-builds/webpack-resolver';
import { CodeBuilder } from '../application/State/Code/CodeBuilder';

const NothingChosenCode =
  new CodeBuilder()
    .appendCommentLine('privacy.sexy — 🔐 Enforce privacy & security best-practices on Windows')
    .appendLine()
    .appendCommentLine('-- 🧐 Why privacy.sexy')
    .appendCommentLine(' ✔️ Rich tweak pool to harden security & privacy of the OS and other softwares on it.')
    .appendCommentLine(' ✔️ You don\'t need to run any compiled software on your system, just run the generated scripts.')
    .appendCommentLine(' ✔️ Have full visibility into what the tweaks do as you enable them.')
    .appendCommentLine(' ✔️ Free software, 100% transparency: both application & infrastructure code are open-sourced.')
    .appendLine()
    .appendCommentLine('-- 🤔 How to use')
    .appendCommentLine(' 📙 Start by exploring different categories and choosing different tweaks.')
    .appendCommentLine(' 📙 You can select "Recommended" on the top to select "safer" tweaks. Always double check!')
    .appendCommentLine(' 📙 After you choose any tweak, you can download & copy to execute your script.')
    .toString();

@Component
export default class TheCodeArea extends StatefulVue {
  public readonly editorId = 'codeEditor';
  private editor!: ace.Ace.Editor;

  @Prop() private theme!: string;

  public async mounted() {
    this.editor = initializeEditor(this.theme, this.editorId);
    const state = await this.getCurrentStateAsync();
    this.updateCode(state.code.current);
    state.code.changed.on((code) => this.updateCode(code));
  }

  private updateCode(code: string) {
    this.editor.setValue(code || NothingChosenCode, 1);
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

<style scoped lang="scss">
.code-area {
    /* ----- Fill its parent div ------ */
    width: 100%;
    /* height */
    max-height: 1000px;
    min-height: 200px;
}
</style>
