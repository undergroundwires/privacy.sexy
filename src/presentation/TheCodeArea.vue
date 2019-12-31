<template>
    <div :id="editorId" class="code-area" ></div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator';
import { StatefulVue, IApplicationState } from './StatefulVue';
import ace from 'ace-builds';
import 'ace-builds/webpack-resolver';


@Component
export default class TheCodeArea extends StatefulVue {
  public readonly editorId = 'codeEditor';
  private editor!: ace.Ace.Editor;

  @Prop() private theme!: string;

  public async mounted() {
    this.editor = this.initializeEditor();
    const state = await this.getCurrentStateAsync();
    this.updateCode(state.code.current);
    state.code.changed.on((code) => this.updateCode(code));
  }

  private updateCode(code: string) {
    this.editor.setValue(code || 'Something is bad 😢', 1);
  }

  private initializeEditor(): ace.Ace.Editor {
    const lang = 'batchfile';
    const theme = this.theme || 'github';
    const editor = ace.edit(this.editorId);
    editor.getSession().setMode(`ace/mode/${lang}`);
    editor.setTheme(`ace/theme/${theme}`);
    editor.setReadOnly(true);
    editor.setAutoScrollEditorIntoView(true);
    // this.editor.getSession().setUseWrapMode(true);
    // this.editor.setOption("indentedSoftWrap", false);
    return editor;
  }
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
