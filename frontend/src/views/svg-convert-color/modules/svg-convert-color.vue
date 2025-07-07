<script setup lang="ts">
import { computed, reactive, ref, watch, h, onMounted } from "vue";
import { createReusableTemplate } from "@vueuse/core";
import { $t } from "@/locales";
import type { DataTableColumns, DataTableRowKey } from "naive-ui";
import {
  NButton,
  useMessage,
  NImage,
  NInput,
  NButtonGroup,
  NIcon,
} from "naive-ui";
import { ipcApiRoute } from "@/service/api/ipc";
import { ipc } from "@/utils/ipcRenderer";
import { saveAs } from "file-saver";
import JSZip from "jszip";
defineOptions({
  name: "SvgConvertColor",
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
  allName: "njxjSvg.zip",
  formats: "BMP, GIF, HEIC, HEIF, JPEG, JPG, PNG, TIF, TIFF".split(", "),
  maxSize: (function () {
    return "204800kb".slice(0, -2) * 1024;
  })(),
  sortable: true,
  //0
});


interface RowData {
  key: number;
  fileName: string;
  fileSize: string;
  fileType: string;
  oldPreview: string;
  newFileCode: string;
  newFilePreview: string;
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
      width: 100,
    },
    {
      title: "fileName",
      key: "fileName",
      resizable: true,
    },
    {
      title: "fileSize",
      key: "fileSize",
      resizable: true,
      width: 80,
    },
    {
      title: "fileType",
      key: "fileType",
      resizable: true,
      width: 100,
    },
    {
      title: "oldPreview",
      key: "oldPreview",
      resizable: true,
      render(rowData, rowIndex) {
        let base64 = btoa(rowData.oldPreview);
        return h(NIcon, {
          size: "100",
          innerHTML: rowData.oldPreview,
        });
      },
    },
    {
      title: "oldFileCode",
      key: "oldFileCode",
      resizable: true,
      render(rowData, rowIndex) {
        return h(NInput, {
          type: "textarea",
          value: rowData.oldPreview,
        });
      },
    },

    {
      title: "newFileCode",
      key: "newFileCode",
      resizable: true,
      render(rowData, rowIndex) {
        return h(NInput, {
          type: "textarea",
          value: rowData.newFileCode,
        });
      },
    },
    {
      title: "newFilePreview",
      key: "newFilePreview",
      resizable: true,
      render(rowData, rowIndex) {
        return h(NIcon, {
          size: "100",
          innerHTML: rowData.newFileCode,
        });
      },
    },

    {
      title: "Action",
      key: "actions",
      render(row) {
        return h(NButtonGroup, { size: "small" }, [
          h(
            NButton,
            {
              strong: true,
              size: "small",
              round: true,
              type: "success",
              onClick: () => downloadBtn(row),
            },
            { default: () => "DownLoad" },
          ),
          h(
            NButton,
            {
              strong: true,
              size: "small",
              round: true,
              type: "error",

              onClick: () => delList(row),
            },
            { default: () => "Del" },
          ),
        ]);
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

const downloadBtn = (row) => {
  download(row);
};

const delList = (row) => {
  formatImgList.value = formatImgList.value.filter(
    (item) => item.key != row.key,
  );
};
const clearAll = () => {
  formatImgList.value = [];
};
const download = (href, name) => {
  if (href && typeof href == "object") {
    name = name || href.fileName;
  }

  const blob = new Blob([href.newFileCode], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.target = "_blank";
  a.download = name;
  document.body.appendChild(a);
  a.click();

  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
};

const downloadAll = async function () {
  if (formatImgList.value.length == 0) {
    message.error("未发现数据");
    return;
  }

  const zip = new JSZip();
  let name = appSettings.value.allName,
    order = formatImgList.value.filter(function (item) {
      return item.newFileCode;
    });

  order.forEach((item) => {
    const blob = new Blob([item.newFileCode], { type: "image/svg+xml" });
    zip.file(item.fileName, blob, { binary: true });
  });
  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, name);
};

const formatImgList = ref<RowData[]>([]);

const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target.result);
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
};
// 替换 fill 属性为 currentColor
const replaceFillWithCurrentColor = (svgContent) => {
  // 替换 fill="..." 属性
  let replacedContent = svgContent.replace(
    /fill="([^"]*)"/g,
    (match, originalValue) => {
      if (originalValue === "currentColor" || originalValue === "none") {
        return match;
      }
      return 'fill="currentColor"';
    },
  );

  // 替换内联 fill 样式
  replacedContent = replacedContent.replace(
    /fill:\s*([^;]*);/g,
    (match, originalValue) => {
      if (
        originalValue.trim() === "currentColor" ||
        originalValue.trim() === "none"
      ) {
        return match;
      }
      return "fill: currentColor;";
    },
  );
  replacedContent = previewSvg(replacedContent);

  return replacedContent;
};

const previewSvg = (svgContent) => {
  // 创建临时 SVG 元素来验证
  const tempSvg = document.createElement("div");
  tempSvg.innerHTML = svgContent;

  // 检查是否有有效的 SVG 元素
  const svgElement = tempSvg.querySelector("svg");
  if (svgElement) {
    // 检查是否有 viewBox 属性
    if (!svgElement.getAttribute("viewBox")) {
      // 从宽度和高度属性获取 viewBox
      const width = svgElement.getAttribute("width");
      const height = svgElement.getAttribute("height");
      if (width && height) {
        svgElement.setAttribute(
          "viewBox",
          `0 0 ${parseInt(width)} ${parseInt(height)}`,
        );
        svgElement.setAttribute("width", "");
        svgElement.setAttribute("height", "");
      }
    }


    svgContent = tempSvg.innerHTML;
  }
  return svgContent;
};

const handleUploadChange = async (list: { fileList: UploadFileInfo[] }) => {
  // debugger;
  console.log("fileList", list, fileList);
  let svgContent = "",
    newFileCode = "",
    newFilePreview = "";
  if (list.file?.file) {
    svgContent = await readFileAsText(list.file.file);
    if(!svgContent || svgContent === 'undefined'){
      message.error(list.file.name + "文件解析格式错误");
      return;
    }
    newFileCode = replaceFillWithCurrentColor(svgContent);
    newFilePreview = newFileCode;
  }

  let item = {
    fileName: list.file.name,
    fileSize: list.file?.file?.size?.toString(),
    fileType: list.file.type,
    oldPreview: previewSvg(svgContent),
    newFileCode: newFileCode,
    newFilePreview: newFilePreview,
    file: list.file.file,
    key: list.file.id,
  };
  // const res = await uploadFile(item);

  formatImgList.value.push(item);
  console.log(formatImgList.value);
  // fileListRef.value = data.fileList
};

const rowKey = (row: RowData) => {
  return row.file?.id;
};
</script>
<template>
  <NCard :bordered="false" size="small" class="card-wrapper">
    <n-upload
      multiple
      directory-dnd
      :file-list="fileList"
      @change="handleUploadChange"
      accept=".svg"
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
          1、单击“上传文件”按钮并选择您想要矢量化的光栅图像。
        </n-p>
        <n-p depth="3" style="margin: 8px 0 0 0">
          2、等待转换过程完成，然后使用缩略图单独下载文件，或将其分组到 ZIP
          存档中。
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

    <n-data-table
      :columns="columns"
      :data="formatImgList"
      :bordered="false"
      :row-key="rowKey"
      :max-height="250"
    />
  </NCard>
</template>
<style scoped></style>
