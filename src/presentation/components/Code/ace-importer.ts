import ace from 'ace-builds';

/*
  Following is here because `import 'ace-builds/webpack-resolver';` does not work with webpack 5.
  Related issue: https://github.com/ajaxorg/ace-builds/issues/211, PR: https://github.com/ajaxorg/ace-builds/pull/221
*/

import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/theme-xcode';
import 'ace-builds/src-noconflict/mode-batchfile';
import 'ace-builds/src-noconflict/mode-sh';

ace.config.setModuleUrl('ace/mode/html_worker', new URL('ace-builds/src-noconflict/worker-html.js', import.meta.url).toString());
ace.config.setModuleUrl('ace/mode/javascript_worker', new URL('ace-builds/src-noconflict/worker-javascript.js', import.meta.url).toString());
ace.config.setModuleUrl('ace/mode/json_worker', new URL('ace-builds/src-noconflict/worker-json.js', import.meta.url).toString());

export default ace;
