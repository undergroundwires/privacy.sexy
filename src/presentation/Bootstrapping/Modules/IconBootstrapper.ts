import { IVueBootstrapper, VueConstructor } from './../IVueBootstrapper';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
/** BRAND ICONS (PREFIX: fab) */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
/** REGULAR ICONS (PREFIX: far) */
import { faFolderOpen, faFolder, faComment, faSmile } from '@fortawesome/free-regular-svg-icons';
/** SOLID ICONS (PREFIX: fas (default)) */
import { faTimes, faFileDownload, faCopy, faSearch, faInfoCircle, faUserSecret, faDesktop, faTag, faGlobe } from '@fortawesome/free-solid-svg-icons';


export class IconBootstrapper implements IVueBootstrapper {
    public bootstrap(vue: VueConstructor): void {
        library.add(
            faGithub,
            faUserSecret,
            faSmile,
            faDesktop,
            faGlobe,
            faTag,
            faFolderOpen,
            faFolder,
            faTimes,
            faFileDownload,
            faCopy,
            faSearch,
            faInfoCircle);
        vue.component('font-awesome-icon', FontAwesomeIcon);
    }
}
