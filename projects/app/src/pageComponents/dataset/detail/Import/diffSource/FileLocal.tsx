import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { type ImportSourceItemType } from '@/web/core/dataset/type.d';
import { Box, Button } from '@chakra-ui/react';
import FileSelector from '../components/FileSelector';
import { useTranslation } from 'next-i18next';

import dynamic from 'next/dynamic';
import Loading from '@fastgpt/web/components/common/MyLoading';
import { RenderUploadFiles } from '../components/RenderFiles';
import { useContextSelector } from 'use-context-selector';
import { DatasetImportContext } from '../Context';

const DataProcess = dynamic(() => import('../commonProgress/DataProcess'));
const PreviewData = dynamic(() => import('../commonProgress/PreviewData'));
const Upload = dynamic(() => import('../commonProgress/Upload'));

const fileType = '.txt, .docx, .csv, .xlsx, .pdf, .md, .html, .pptx';

const FileLocal = () => {
  const activeStep = useContextSelector(DatasetImportContext, (v) => v.activeStep);

  return (
    <>
      {activeStep === 0 && <SelectFile />}
      {activeStep === 1 && <DataProcess />}
      {activeStep === 2 && <PreviewData />}
      {activeStep === 3 && <Upload />}
    </>
  );
};

export default React.memo(FileLocal);

const SelectFile = React.memo(function SelectFile() {
  const { t } = useTranslation();
  const { goToNext, sources, setSources } = useContextSelector(DatasetImportContext, (v) => v);
  const [selectFiles, setSelectFiles] = useState<ImportSourceItemType[]>(
    sources.map((source) => ({
      isUploading: false,
      ...source
    }))
  );
  const [uploading, setUploading] = useState(false);
  const successFiles = useMemo(() => selectFiles.filter((item) => !item.errorMsg), [selectFiles]);

  useEffect(() => {
    setSources(successFiles);
  }, [setSources, successFiles]);

  const onclickNext = useCallback(() => {
    // filter uploaded files
    setSelectFiles((state) => state.filter((item) => item.dbFileId));
    goToNext();
  }, [goToNext]);

  return (
    <Box>
      <FileSelector
        fileType={fileType}
        selectFiles={selectFiles}
        setSelectFiles={setSelectFiles}
        onStartSelect={() => setUploading(true)}
        onFinishSelect={() => setUploading(false)}
      />

      {/* render files */}
      <RenderUploadFiles files={selectFiles} setFiles={setSelectFiles} />

      <Box textAlign={'right'} mt={5}>
        <Button isDisabled={successFiles.length === 0 || uploading} onClick={onclickNext}>
          {selectFiles.length > 0
            ? `${t('dataset:total_num_files', { total: selectFiles.length })} | `
            : ''}
          {t('common:next_step')}
        </Button>
      </Box>
    </Box>
  );
});
