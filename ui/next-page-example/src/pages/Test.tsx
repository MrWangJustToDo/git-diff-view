import { DiffFile, DiffView } from "@git-diff-view/react";
import { GetServerSideProps } from "next"

const sleep = (time: number) => new Promise((resolve) => setTimeout(resolve, time));

const d = `@@ -129,6 +129,8 @@ export class DiffFile {
 
   unifiedLineLength: number = 0;
 
+  fileLineLength: number = 0;
+
   hasExpandSplitAll: boolean = false;
 
   hasExpandUnifiedAll: boolean = false;
@@ -210,10 +212,14 @@ export class DiffFile {
 
     if (this._oldFileContent) {
       this.#oldFileResult = getFile(this._oldFileContent, this._oldFileLang, this._oldFileName);
+
+      this.fileLineLength = Math.max(this.fileLineLength, this.#oldFileResult.maxLineNumber);
     }
 
     if (this._newFileContent) {
       this.#newFileResult = getFile(this._newFileContent, this._newFileLang, this._newFileName);
+
+      this.fileLineLength = Math.max(this.fileLineLength, this.#newFileResult.maxLineNumber);
     }
   }
 
@@ -271,6 +277,11 @@ export class DiffFile {
       this.#newFileResult = getFile(this._newFileContent, this._newFileLang, this._newFileName);
       this.#oldFilePlaceholderLines = oldFilePlaceholderLines;
       this.#newFilePlaceholderLines = newFilePlaceholderLines;
+      this.fileLineLength = Math.max(
+        this.fileLineLength,
+        this.#oldFileResult.maxLineNumber,
+        this.#newFileResult.maxLineNumber
+      );
       // all of the file just compose by diff, so we can not do the expand action
       this.#composeByDiff = true;
     } else if (this.#oldFileResult) {
@@ -297,6 +308,7 @@ export class DiffFile {
       if (!hasSymbolChanged && newFileContent === this._oldFileContent) return;
       this._newFileContent = newFileContent;
       this.#newFileResult = getFile(this._newFileContent, this._newFileLang, this._newFileName);
+      this.fileLineLength = Math.max(this.fileLineLength, this.#newFileResult.maxLineNumber);
     } else if (this.#newFileResult) {
       let oldLineNumber = 1;
       let newLineNumber = 1;
@@ -321,6 +333,7 @@ export class DiffFile {
       if (!hasSymbolChanged && oldFileContent === this._newFileContent) return;
       this._oldFileContent = oldFileContent;
       this.#oldFileResult = getFile(this._oldFileContent, this._oldFileLang, this._oldFileName);
+      this.fileLineLength = Math.max(this.fileLineLength, this.#oldFileResult.maxLineNumber);
     }
 
     this.#composeRaw();
@@ -1133,6 +1146,7 @@ export class DiffFile {
     const newFilePlaceholderLines = this.#newFilePlaceholderLines;
     const splitLineLength = this.splitLineLength;
     const unifiedLineLength = this.unifiedLineLength;
+    const fileLineLength = this.fileLineLength;
     const composeByDiff = this.#composeByDiff;
     const highlighterName = this.#highlighterName;
     const hasSomeLineCollapsed = this.hasSomeLineCollapsed;
@@ -1163,6 +1177,7 @@ export class DiffFile {
       newFilePlaceholderLines,
       splitLineLength,
       unifiedLineLength,
+      fileLineLength,
       splitLeftLines,
       splitRightLines,
       splitHunkLines,
@@ -1197,6 +1212,7 @@ export class DiffFile {
     this.#newFilePlaceholderLines = data.newFilePlaceholderLines;
     this.splitLineLength = data.splitLineLength;
     this.unifiedLineLength = data.unifiedLineLength;
+    this.fileLineLength = data.fileLineLength;
     this.hasSomeLineCollapsed = data.hasSomeLineCollapsed;
 
     this.#splitLeftLines = data.splitLeftLines;`

export default function Test({patch, diffFile}: {patch: string, diffFile: string}) {
  // console.log(patch);

  const file = DiffFile.createInstance({}, JSON.parse(diffFile));

  return <DiffView diffFile={file} diffViewHighlight diffViewWrap diffViewFontSize={14} />;

     // return <DiffView data={{hunks: [a1, a2], oldFile: {content: oldF}, newFile: {content: newF, fileLang: 'c'}}} diffViewHighlight diffViewWrap/>
}

export const getServerSideProps: GetServerSideProps = async () => {
  const p = `--- a \n+++ b \n` + (d.endsWith("\n") ? d : d + "\n")

  const diffFile = new DiffFile('', '', '', '', [p], 'ts');

  diffFile.init();

  diffFile.buildSplitDiffLines();

  diffFile.buildUnifiedDiffLines();

  const data = diffFile._getFullBundle();

  const stringData = JSON.stringify(data);

  return {props: {patch: d, diffFile: stringData}};
}