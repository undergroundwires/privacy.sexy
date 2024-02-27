<template>
  <SizeObserver
    v-non-collapsing
    @size-changed="sizeChanged()"
  >
    <!-- `data-test-highlighted-range` is a test hook for assessing highlighted text range -->
    <div
      :id="editorId"
      :data-test-highlighted-range="highlightedRange"
      class="code-area"
    />
  </SizeObserver>
</template>

<script lang="ts">
import {
  defineComponent, onUnmounted, onMounted, ref,
} from 'vue';
import { injectKey } from '@/presentation/injectionSymbols';
import type { ICodeChangedEvent } from '@/application/Context/State/Code/Event/ICodeChangedEvent';
import type { IScript } from '@/domain/IScript';
import { ScriptingLanguage } from '@/domain/ScriptingLanguage';
import type { IReadOnlyCategoryCollectionState } from '@/application/Context/State/ICategoryCollectionState';
import { CodeBuilderFactory } from '@/application/Context/State/Code/Generation/CodeBuilderFactory';
import SizeObserver from '@/presentation/components/Shared/SizeObserver.vue';
import { NonCollapsing } from '@/presentation/components/Scripts/View/Cards/NonCollapsingDirective';
import type { ProjectDetails } from '@/domain/Project/ProjectDetails';
import ace from './ace-importer';

export default defineComponent({
  components: {
    SizeObserver,
  },
  directives: {
    NonCollapsing,
  },
  props: {
    theme: {
      type: String,
      default: undefined,
    },
  },
  setup(props) {
    const { onStateChange, currentState } = injectKey((keys) => keys.useCollectionState);
    const { projectDetails } = injectKey((keys) => keys.useApplication);
    const { events } = injectKey((keys) => keys.useAutoUnsubscribedEvents);

    const editorId = 'codeEditor';
    const highlightedRange = ref(0);

    let editor: ace.Ace.Editor | undefined;
    let currentMarkerId: number | undefined;

    onUnmounted(() => {
      destroyEditor();
    });

    onMounted(() => { // allow editor HTML to render
      onStateChange((newState) => {
        handleNewState(newState);
      }, { immediate: true });
    });

    function handleNewState(newState: IReadOnlyCategoryCollectionState) {
      destroyEditor();
      editor = initializeEditor(
        props.theme,
        editorId,
        newState.collection.scripting.language,
      );
      const appCode = newState.code;
      updateCode(appCode.current, newState.collection.scripting.language);
      events.unsubscribeAllAndRegister([
        appCode.changed.on((code) => handleCodeChange(code)),
      ]);
    }

    function updateCode(code: string, language: ScriptingLanguage) {
      const innerCode = code || getDefaultCode(language, projectDetails);
      editor?.setValue(innerCode, 1);
    }

    function handleCodeChange(event: ICodeChangedEvent) {
      removeCurrentHighlighting();
      updateCode(event.code, currentState.value.collection.scripting.language);
      if (event.addedScripts?.length > 0) {
        reactToChanges(event, event.addedScripts);
      } else if (event.changedScripts?.length > 0) {
        reactToChanges(event, event.changedScripts);
      }
    }

    function sizeChanged() {
      editor?.resize();
    }

    function destroyEditor() {
      editor?.destroy();
      editor = undefined;
    }

    function removeCurrentHighlighting() {
      if (!currentMarkerId) {
        return;
      }
      editor?.session.removeMarker(currentMarkerId);
      currentMarkerId = undefined;
      highlightedRange.value = 0;
    }

    function reactToChanges(event: ICodeChangedEvent, scripts: ReadonlyArray<IScript>) {
      const positions = scripts
        .map((script) => event.getScriptPositionInCode(script));
      const start = Math.min(
        ...positions.map((position) => position.startLine),
      );
      const end = Math.max(
        ...positions.map((position) => position.endLine),
      );
      scrollToLine(end + 2);
      highlight(start, end);
    }

    function highlight(startRow: number, endRow: number) {
      const AceRange = ace.require('ace/range').Range;
      currentMarkerId = editor?.session.addMarker(
        new AceRange(startRow, 0, endRow, 0),
        'code-area__highlight',
        'fullLine',
      );
      highlightedRange.value = endRow - startRow;
    }

    function scrollToLine(row: number) {
      const column = editor?.session.getLine(row).length;
      if (column === undefined) {
        return;
      }
      editor?.gotoLine(row, column, true);
    }

    return {
      editorId,
      highlightedRange,
      sizeChanged,
    };
  },
});

function initializeEditor(
  theme: string | undefined,
  editorId: string,
  language: ScriptingLanguage,
): ace.Ace.Editor {
  theme = theme || 'github';
  const editor = ace.edit(editorId);
  const lang = getLanguage(language);
  editor.getSession().setMode(`ace/mode/${lang}`);
  editor.setTheme(`ace/theme/${theme}`);
  editor.setReadOnly(true);
  editor.setAutoScrollEditorIntoView(true);
  editor.setShowPrintMargin(false); // hides vertical line
  editor.getSession().setUseWrapMode(true); // So code is readable on mobile
  return editor;
}

function getLanguage(language: ScriptingLanguage) {
  switch (language) {
    case ScriptingLanguage.batchfile: return 'batchfile';
    case ScriptingLanguage.shellscript: return 'sh';
    default:
      throw new Error('unknown language');
  }
}

function getDefaultCode(language: ScriptingLanguage, project: ProjectDetails): string {
  return new CodeBuilderFactory()
    .create(language)
    .appendCommentLine(`${project.name} — ${project.slogan}`)
    /*
      Keep the slogan without a period for impact and continuity.
      Slogans should be punchy and memorable, not punctuated like full sentences.
    */
    .appendCommentLine(' 🔐 Enforce privacy & security best-practices on Windows, macOS and Linux.')
    .appendLine()
    .appendCommentLine('-- 🤔 How to use')
    .appendCommentLine(' 📙 Start by exploring different categories and choosing different tweaks.')
    .appendCommentLine(' 📙 On top left, you can apply predefined selections for privacy level you\'d like.')
    .appendCommentLine(' 📙 After you choose any tweak, you can download or copy to execute your script.')
    .appendCommentLine(' 📙 Come back regularly to apply latest version for stronger privacy and security.')
    .appendLine()
    .appendCommentLine(`-- 🧐 Why ${project.name}`)
    .appendCommentLine(' ✔️ Rich tweak pool to harden security & privacy of the OS and other software on it.')
    .appendCommentLine(' ✔️ No need to run any compiled software on your system, just run the generated scripts.')
    .appendCommentLine(' ✔️ Have full visibility into what the tweaks do as you enable them.')
    .appendCommentLine(' ✔️ Open-source and free (both free as in beer and free as in speech).')
    .appendCommentLine(' ✔️ Committed to your safety with strong security measures.')
    .toString();
}

</script>

<style scoped lang="scss">
@use "@/presentation/assets/styles/main" as *;

:deep() {
  .code-area {
    min-height: 200px;
    width: 100%;
    height: 100%;
    overflow: auto;
    font-size: $font-size-absolute-small;
    font-family: $font-family-monospace;
    &__highlight {
      background-color: $color-secondary-light;
      position: absolute;
    }
  }
}
</style>
