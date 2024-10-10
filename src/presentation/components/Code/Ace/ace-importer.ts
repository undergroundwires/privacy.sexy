import ace from 'ace-builds';

/*
  Following is here because `import 'ace-builds/esm-resolver' imports all unused functionality
  when built with Vite (`npm run build`).
*/

import 'ace-builds/src-noconflict/theme-xcode';
import 'ace-builds/src-noconflict/mode-batchfile';
import 'ace-builds/src-noconflict/mode-sh';

ace.config.setModuleUrl('ace/mode/html_worker', new URL('ace-builds/src-noconflict/worker-html.js', import.meta.url).toString());
ace.config.setModuleUrl('ace/mode/javascript_worker', new URL('ace-builds/src-noconflict/worker-javascript.js', import.meta.url).toString());
ace.config.setModuleUrl('ace/mode/json_worker', new URL('ace-builds/src-noconflict/worker-json.js', import.meta.url).toString());

export default ace;
