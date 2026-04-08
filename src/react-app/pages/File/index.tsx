import React, { use, useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { App } from 'antd';
import request from '../../utils/request'

interface UploadProps {
    // 上传成功后的回调，方便刷新文件列表
    onUploadSuccess?: (fileKey: string) => void;
}

// --- 定义 API 返回的数据结构 ---
interface S3File {
    file_key: string;
    file_type: string;
    uploaded_at: number; // 秒级时间戳
}

interface ApiResponse {
    code: number;
    message: string;
    data: {
        total: number;
        data: S3File[];
        page: number;
        pageSize: number;
    };
}

const S3UploadComponent: React.FC<UploadProps> = () => {
    const { message } = App.useApp();
    const [files, setFiles] = useState<S3File[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [uploadTimes, setUploadTimes] = useState(0);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const { data: { data } } = await request.get("/api/v1/file/logs") as any;
            setFiles(data);
        } catch (e) {
            message.error("get file history failed:" + e);
        } finally {
            setLoading(false);
        }
    }

    React.useEffect(() => {
        fetchHistory();
    }, [uploadTimes]);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setUploading(true);
        setProgress(0);
        try {
            // 1. 从后端获取 uploadUrl 和 key
            const data = (await request.post("/api/v1/file/preupload", {
                name: file.name
            })) as any;
            console.log("preupload", data)
            const { uploadUrl, key } = data.data;

            // 2. 使用 PUT 直接上传到 S3
            await axios.put(uploadUrl, file, {
                headers: { 'Content-Type': file.type },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / (progressEvent.total || 1)
                    );
                    setProgress(percentCompleted);
                },
            });

            //添加数据到历史
            await request.post("/api/v1/file/log", {
                key: key,
                type: file.type
            })
            message.success("upload successful");
            setUploadTimes(uploadTimes + 1);
        } catch (error) {
            console.error('failed:', error);
            message.error("upload failed" + error);
        } finally {
            setUploading(false);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false // 设置为 false 方便单文件管理
    });

    return (
        <div style={containerStyle}>
            <div {...getRootProps()} style={{
                ...dropzoneStyle,
                backgroundColor: isDragActive ? '#f0f7ff' : '#fafafa',
                borderColor: isDragActive ? '#007bff' : '#eee'
            }}>
                <input {...getInputProps()} />
                {uploading ? (
                    <div>
                        <p>Uploading... {progress}%</p>
                        <div style={progressBarContainer}>
                            <div style={{ ...progressBar, width: `${progress}%` }} />
                        </div>
                    </div>
                ) : isDragActive ? (
                    <p>Release mouse to upload</p>
                ) : (
                    <p>Drag and drop a file here, or click to select a file</p>
                )}
            </div>
            <h3>Upload History</h3>
            {loading ? <p>loading...</p> : (
                <table style={tableStyle}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8f9fa' }}>
                            <th style={thStyle}>File name (Key)</th>
                            <th style={thStyle}>Type</th>
                            <th style={thStyle}>UploadedAt</th>
                            <th style={thStyle}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {files.length > 0 ? files.map((file) => (
                            <tr key={file.file_key} style={trStyle}>
                                <td style={tdStyle} title={file.file_key}>
                                    {file.file_key.split('/').pop()} {/* 只显示文件名部分 */}
                                </td>
                                <td style={tdStyle}>{file.file_type}</td>
                                <td style={tdStyle}>
                                    {new Date(file.uploaded_at * 1000).toLocaleString()}
                                </td>
                                <td style={tdStyle}>
                                    <button onClick={() => {
                                        const url = `https://tools-resource.s3.ap-northeast-1.amazonaws.com/${file.file_key}`;
                                        navigator.clipboard.writeText(url).then(() => {
                                            message.success("Link copied to clipboard");
                                        }).catch(() => {
                                            message.error("Failed to copy link");
                                        });
                                    }} style={btnStyle}>Copy Link</button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={4} style={{ textAlign: 'center', padding: '20px' }}>No Data</td></tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
};

// --- 样式定义 ---
const containerStyle: React.CSSProperties = {
    margin: '20px 0',
};

const dropzoneStyle: React.CSSProperties = {
    border: '2px dashed #eee',
    borderRadius: '8px',
    padding: '40px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
};

const progressBarContainer: React.CSSProperties = {
    width: '100%',
    height: '8px',
    backgroundColor: '#eee',
    borderRadius: '4px',
    marginTop: '10px',
};

const progressBar: React.CSSProperties = {
    height: '100%',
    backgroundColor: '#007bff',
    borderRadius: '4px',
    transition: 'width 0.2s ease',
};

const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', marginTop: '10px' };
const thStyle: React.CSSProperties = { textAlign: 'left', padding: '12px', borderBottom: '2px solid #eee' };
const tdStyle: React.CSSProperties = { padding: '12px', borderBottom: '1px solid #eee', fontSize: '14px' };
const trStyle: React.CSSProperties = { transition: 'background 0.2s' };
const btnStyle: React.CSSProperties = { padding: '4px 12px', cursor: 'pointer', backgroundColor: '#fff', border: '1px solid #007bff', color: '#007bff', borderRadius: '4px' };

export default S3UploadComponent;