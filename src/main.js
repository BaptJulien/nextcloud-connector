/**
 * @copyright Copyright (c) 2021, Watcha <contact@watcha.fr>
 *
 * @author Charlie Calendre <c-cal@watcha.fr>
 *
 * @license GNU AGPL version 3 or any later version
 *
 */

"use strict";

function embed() {
    const params = new URLSearchParams(window.parent.location.search);
    const flavor = params.get("flavor");
    switch (flavor) {
        case "file-explorer":
            console.debug("[watcha] embedding file-explorer");
            watchDocumentSelection();
            embedFileExplorer();
            break;
        case "widget":
            const isCurrentChunck = chunck =>
                new RegExp(`^${OC.webroot}(/index.php)?/${chunck}`).test(window.location.pathname);
            const isCurrentApp = appName => isCurrentChunck("apps/" + appName);
            if (isCurrentApp("files")) {
                console.debug("[watcha] embedding files widget");
                embedFilesWidget();
            } else if (isCurrentApp("calendar")) {
                console.debug("[watcha] embedding calendar widget");
                embedCalendarWidget();
            } else if (isCurrentApp("tasks")) {
                console.debug("[watcha] embedding tasks widget");
                embedTasksWidget();
            } else if (isCurrentChunck("s/[A-Za-z0-9]+?")) {
                console.debug("[watcha] embedding direct link files widget");
                embedDirectLinkFilesWidget();
            }
            break;
    }
}

function embedFileExplorer() {
    _hideFilesToolbar();
    const style = `
        #app-navigation,                /* left panel */
        #app-navigation-toggle,
        #filelist-header,               /* notes section */
        #controls span.icon-shared,     /* breadcrumb share icon */
        #view-toggle,                   /* top right button */
        #selectedActionsList,
        .fileactions,
        #rightClickMenus,
        aside {                         /* right panel */
            display: none !important;
        }

        #controls {
            padding-left: 0 !important;
        }

        #app-content {
            margin-left: 0 !important;
            transform: none !important;
        }

        tr[data-type="file"] > td:not(.selection) {
            pointer-events: none;
        }`;
    _injectStyle(style);
}

function embedFilesWidget() {
    _hideFilesToolbar();
    _watchForBreadcrumb();
    const style = `
        #app-navigation > ul > li:not(.pinned) {
            display: none !important;
        }`;
    _injectStyle(style);
}

function embedCalendarWidget() {
    _hideCalendarToolbar();
}

function embedTasksWidget() {
    _hideCalendarToolbar();
    const style = `
        .header {
            top: 0 !important;
        }`;
    _injectStyle(style);
}

function embedDirectLinkFilesWidget() {
    const style = `
        #header {
            justify-content: center !important;
            background-color: var(--color-main-background) !important;
            background-image: none !important;
        }

        #header > .header-left,
        #header-secondary-action {
            display: none !important;
        }

        #header-primary-action > a {
            background-color: rgb(0, 179, 179) !important;
            border-color: rgb(0, 179, 179) !important;
            border-radius: 8px !important;
        }`;
    _injectStyle(style);
}

function _hideFilesToolbar() {
    const style = `
        #header {
            display: none !important;
        }

        #app-navigation,
        #controls {
            top: 0 !important;
        }

        #content {
            padding-top: 0 !important;
        }

        #body-user,
        #app-navigation {
            height: 100% !important;
        }

        #filestable > thead {
            top: 44px !important;
        }`;
    _injectStyle(style);
}

function _hideCalendarToolbar() {
    const style = `
        #header {
            display: none !important;
        }

        #app-navigation-vue {
            height: 100vh !important;
        }

        #content-vue {
            padding-top: 0 !important;
        }`;
    _injectStyle(style);
}

function _watchForBreadcrumb() {
    const controls = document.getElementById("controls");
    controls.style.visibility = "hidden";
    const callback = mutationsList => {
        for (let mutation of mutationsList) {
            for (let node of mutation.addedNodes) {
                if (node.className === "breadcrumb") {
                    observer.disconnect();
                    _hideBreadcrumbAncestors();
                    controls.style.visibility = "visible";
                    return;
                }
            }
        }
    };
    const observer = new MutationObserver(callback);
    const config = { childList: true };
    observer.observe(controls, config);
    console.debug("[watcha] watching for breadcrumb");
}

function _hideBreadcrumbAncestors() {
    console.debug("[watcha] hidding breadcrumb");
    const ancestorSelector = "#controls > .breadcrumb > :is(.crumbmenu, .ui-droppable)";
    const n = document.querySelectorAll(ancestorSelector).length;
    const style = `
    #controls > .breadcrumb > .crumb {
        display: inline-flex !important;
    }
    ${ancestorSelector}:not(:nth-child(n+${n + 1})) {
        display: none !important;
    }`;
    _injectStyle(style);
}

function _injectStyle(style) {
    let element = document.createElement("style");
    element.innerHTML = style;
    document.head.appendChild(element);
}

function watchDocumentSelection() {
    console.debug("[watcha] watching document selection");
    document.getElementById("select_all_files").addEventListener("input", () => {
        postSelectedDocuments();
    });
    document.getElementById("fileList").addEventListener("input", ({ target }) => {
        if (
            target.classList.contains("selectCheckBox") &&
            target.parentNode.nodeName === "TD" &&
            target.parentNode.className === "selection"
        ) {
            postSelectedDocuments();
        }
    });
}

function postSelectedDocuments() {
    // wait for OCA.Files.App.fileList._selectedFiles to be updated
    _.defer(() => {
        const documents = OCA.Files.App.fileList.getSelectedFiles();
        window.top.postMessage(documents, OC.appConfig.watcha?.origin || "");
        console.debug("[watcha] selected documents++:", documents);
    });
}

if (
    // this window must be an iframe
    window.self !== window.parent &&
    // this window must be embedded by the Watcha connector for Nextcloud
    window.parent.location.pathname === OC.webroot + "/apps/watcha/embed"
) {
    embed();
}