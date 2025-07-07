<script setup lang="ts">
import { computed, reactive, ref, watch, h, onMounted } from "vue";
import { createReusableTemplate } from "@vueuse/core";
import { $t } from "@/locales";
import { ImageConvert, FormDataValue, Format } from "@/service/api/img";
import type { DataTableColumns, DataTableRowKey } from "naive-ui";
import { NButton, useMessage, NImage,NInput,NButtonGroup } from "naive-ui";
import { ipcApiRoute } from "@/service/api/ipc";
import { ipc } from "@/utils/ipcRenderer";
import {  useDebounceFn } from '@vueuse/core';
defineOptions({
  name: "PngToSvg2",
});

const formData = reactive<FormDataValue>({
  fileList: [],
  format: "svg",
});

const appSettings = ref({
  origin: "https://vectorizer.com/",
  title: "免费图像矢量化",
  // convertParams: {format:"epub"},
  maxLength: 20,
  allName: "vectorizer.zip",
  formats: ("BMP, GIF, HEIC, HEIF, JPEG, JPG, PNG, TIF, TIFF").split(", "),
  show:false,
  maxSize: (function () {
    return ("204800kb").slice(0, -2) * 1024;
  }
  )(),
  sortable: true,
  //0
});

const acceptType : string = appSettings.value.formats.map((item) => `.${item.toLowerCase()}`).join(",");

const sessionId = ref("");

interface RowData {
  key: number;
  fileName: string;
  fileSize: string;
  fileType: string;
  fileBase64: string;
  format: string;
  svgUrl: string;
  file: File;
}

function createColumns({
  play,
}: {
  play: (row: RowData) => void;
}): DataTableColumns<RowData> {
  return [
    {
      title: "key",
      key: "key",
      resizable: true,
      width:100
    },
    {
      title: "fileName",
      key: "fileName",
      resizable: true
    },
    {
      title: "fileSize",
      key: "fileSize",
      resizable: true,
      width:80
    },
    {
      title: "fileType",
      key: "fileType",
      resizable: true,
      width:100
    },
    {
      title: "fileBase64",
      key: "fileBase64",
      resizable: true,
      render(rowData, rowIndex) {
        return h(NImage, {
          width: 50,
          height: 50,
          style: "margin-right:5px;",
          src: rowData.fileBase64,
        });
      },
    },
    {
      title: "format",
      key: "format",
      resizable: true
    },
    {
      title: "svgUrl",
      key: "svgUrl",
      resizable: true,
      render(rowData, rowIndex) {
        return h(NInput, {
          type:"text",
          value: appSettings.value.origin + "download/" + rowData.result.sid + "/" + rowData.result.fid + "/" + rowData.result.convert_result,
        });
      },
    },
    {
      title: "Action",
      key: "actions",
      render(row) {

        return  h(NButtonGroup,{size:"small"},[h(
          NButton,
          {
            strong: true,
            size: "small",
            round:true,
            type:"success",
            onClick: () => downloadBtn(row),
          },
          { default: () => "DownLoad" },
        ),h(
          NButton,
          {
            strong: true,
            size: "small",
            round:true,
            type:'error',

            onClick: () => delList(row),
          },
          { default: () => "Del" },
        )]);
      },
    },
  ];
}
const message = useMessage();

const columns = createColumns({
  play(row: RowData) {
    message.info(`Play ${row.fileName}`);
  },
});





let fileList = ref<File[]>([]);
let idList = ref<string[]>([]);

const createId = (length, prefix) => {
  length = length || 16;
  prefix = prefix || "";
  let result = "";
  while (result.length < length) {
    result += Math.floor(65535 * Math.random()).toString(32);
  }
  result = prefix + result.slice(0, length);
  if (idList.value.indexOf(result) != -1) {
    return createId(length, prefix);
  } else {
    idList.value.push(result);
    return result;
  }
}
const downloadBtn = (row) => {
  debugger
  download(row.result, row.fileName)
}

const delList = (row) => {
  formatImgList.value = formatImgList.value.filter((item) => item.key != row.key);
}
const clearAll = () => {

  formatImgList.value = [];
}
const download = (href, name) => {

  const a = document.createElement("a");
  if (href && typeof href == "object") {

    name = name ||  href.name;
    href = appSettings.value.origin + "download/" + href.sid + "/" + href.fid + "/" + href.convert_result;
  }
  a.href = href;
  a.target = "_blank";
  a.download = name;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  requestAnimationFrame(function () {
    document.body.removeChild(a);
  });
}


const downloadAll = function () {
  if(formatImgList.value.length == 0){
    message.error("未发现数据");
    return;
  }
  let name = appSettings.value.allName,
    order = formatImgList.value.filter(function (item) {
      return item.result?.convert_result
    }).map(function (item) {
      return item.result.fid
    }),
    href = appSettings.value.origin + "all/" + sessionId.value + "/" + name + "?order=" + order.join(",") + "&rnd=" + Math.random();
  download(href, name);
}

const uploadFile = async (file) => {
  let href = appSettings.value.origin + "upload/" + sessionId.value;
  let n = new FormData();
  // file.id = createId(26, "file_")
  n.append("file", file.file);
  n.append("id", file.id);
  n.append("name", file.fileName);


  try{
    let response = await fetch(href, {
      method: 'POST',
      body: n
    });
    let result = await response.json();
    console.log("result:", result)
    if (result.id) {
     await processFile(result, file)
     return true;
    }
  }catch(e){
    console.log(e)
    message.error(file.fileName + "转换失败")
    appSettings.value.show = false;
    return false;
  }

}
const checkImgStatus = async (href,file1)=>{
  let response2 = await fetch(href);
    let result2 = await response2.json();
    if(result2.status != "success" ){
      // debugger
      await checkImgStatus(href,file1);
      return false;
    }
    console.log(result2.status,href)
    file1.result = result2;
    message.info("转换完成，点击下载",)
    console.log(response2, )
    return true
    // download(result2)
}
const processFile = async (file,file1) => {
  let href = appSettings.value.origin + "convert/" + sessionId.value + "/" + file.id + "?rnd" + Math.random();
  let response = await fetch(href);
  let result = await response.json();
  if (result.status == "success") {
    href = href.replace("/convert/", "/status/");
    let res = await checkImgStatus(href,file1);


}else{
  message.error(file1.fileName + "转换失败")
}
}



const formatImgList = ref<RowData[]>([]);

const localImageToBase64 = (file: File) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};


const getFileNameWithoutExtension = function (n) {
  if (n == null || n == "") return n;
  var t = n.indexOf(".");
  return t > 0 ? n.substring(0, t) : n;
};
const getFileNameExtension = function (n) {
  if (n == null || n == "") return n;
  var t = n.indexOf(".");
  return t > 0 ? n.substring(t + 1) : "";
};

onMounted(() => {

  sessionId.value = createId();
});

var nameOf = (n) => n.toString().replace(/[ |\(\)=>]/g, "");



const handleUploadChange = async (list: { fileList: UploadFileInfo[] }) => {
  // debugger;
  console.log("fileList", list,fileList);
  let fileBase64 = "";
  if (list.file?.file) {
    fileBase64 = await localImageToBase64(list.file.file);
  }
  appSettings.value.show = true;
  let item = {
    fileName: list.file.name,
    fileSize: list.file?.file?.size?.toString(),
    fileType: list.file.type,
    fileBase64: fileBase64,
    format: formData.format,
    svgUrl: "",
    file: list.file.file,
    id:createId(26, "file_"),
    key: list.file.id,
  }
  const res = await uploadFile(item);

  formatImgList.value.push(item);
  appSettings.value.show = false;
  console.log(formatImgList.value);
  // fileListRef.value = data.fileList
};


const rowKey = (row: RowData) => {
  return row.file?.id;
};


</script>
<template>
  <NCard :bordered="false" size="small" class="card-wrapper">
    <n-upload multiple directory-dnd :max="20" :file-list="fileList" :accept="acceptType" @change="handleUploadChange"
    >
      <n-upload-dragger>
        <div style="margin-bottom: 12px">
          <n-icon size="48" :depth="3">
            <SvgIcon local-icon="CloudUpload" />
          </n-icon>
        </div>
        <n-text style="font-size: 16px">
          点击或者拖动文件到该区域来上传
        </n-text>
        <n-p depth="3" style="margin: 8px 0 0 0">
          1、单击“上传文件”按钮并选择最多 20 张您想要矢量化的光栅图像。
        </n-p>
        <n-p depth="3" style="margin: 8px 0 0 0">
          2、等待转换过程完成，然后使用缩略图单独下载文件，或将其分组到 ZIP 存档中。
        </n-p>
      </n-upload-dragger>
    </n-upload>
    <n-flex justify="end">
      <n-statistic label="当前列表">
       共{{ formatImgList.length }}条
      </n-statistic>
      <n-button type="primary" @click="downloadAll">下载全部</n-button>
      <n-button type="primary" @click="clearAll">清空全部</n-button>
    </n-flex>
    <n-spin :show="appSettings.show">
    <n-data-table :columns="columns" :data="formatImgList" :bordered="false" :row-key="rowKey"
     :max-height="250" />
    </n-spin>

  </NCard>
</template>
<style scoped></style>
