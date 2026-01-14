import React, { useState } from 'react';
import { Button, Card, Switch, Upload, message } from 'antd';
import { InboxOutlined,LoadingOutlined } from '@ant-design/icons';
import request from '../../utils/request';

const IP_REG = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
function filterContent(content){
  let c = content.split('\n').map(line=>line.trim()).filter(line=>IP_REG.test(line)).join('\n');
  return c;
}

const IpAdd = () => {
  const [fileContent, setFileContent] = useState('');
  const [uploading, setUploading] = useState(false);
  const [flag, setFlag] = useState(false);

  const handleUpload = async () => {
    setUploading(true);
    try {
      if(fileContent.length===0){
        message.error('No valid IP addresses found in the file.');
        return;
      }
      let addresses = fileContent.split('\n').filter(line=>line.length>0);
      var chunkSize = 200;
      for (let i = 0; i < addresses.length; i += chunkSize) {
        const chunk = addresses.slice(i, i + chunkSize);
        const response = await request.post('/api/v2/ip/add', {
          addresses: chunk,
          flag: i==0? (flag ? 9527 : 0) : 0,
        });
      }
      message.success('Success');
      setFileContent('');
    } catch (error) {
      message.error(`Failed:${error}`);
    }finally{
      setUploading(false);
    }
  };

  const props = {
    name: 'file',
    multiple: false,
    accept: '.txt',
    maxCount:1,
    beforeUpload:(file)=>{
      return false;
    },
    onRemove:(file)=>{
      setFileContent('');
      return true;
    },
    onChange(info) {
      const file = info.fileList[0];
      if(file){
        const reader = new FileReader();
        reader.onload = (e) => {
          setFileContent(filterContent(e.target.result));
        };
        reader.readAsText(file.originFileObj);
      }
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    },
  };

  return (
    <Card title="IP Address Management" style={{ maxWidth: 800, margin: '0 auto' }}>
      <Upload.Dragger {...props}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Click or drag file to this area to upload</p>
        <p className="ant-upload-hint">
          Support for a single or bulk upload. Strictly prohibited from uploading company data or other
          banned files.
        </p>
      </Upload.Dragger>
      <div style={{ marginTop: 16 }}>
        <Switch
          checked={flag}
          onChange={(checked) => setFlag(checked)}
          checkedChildren="Overwrite Records"
          unCheckedChildren="Append Records"
        />
      </div>
      <Button type="primary" disabled={fileContent.length == 0 || uploading} onClick={handleUpload} style={{ marginTop: 16 }}>
        {uploading ? <><LoadingOutlined /> Uploading...</> : 'Upload'}
      </Button>
      <div style={{ marginTop: 16, whiteSpace: 'pre-wrap', border: '1px solid #ccc', padding: 8, minHeight: 100,maxHeight:600,overflow:"scroll" }}>
        {fileContent || 'file content will be displayed here'}
      </div>
    </Card >
  );
}

export default IpAdd;