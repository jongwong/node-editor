export const ServerUrl = 'http://localhost:3000';

export const bundleFiles = async files => {
	const data = files?.map(it => ({ ...it, filename: it.filename })); // 请求体数据，可以根据需要调整

	try {
		// 发送 POST 请求
		const response = await fetch(ServerUrl + '/api/files', {
			method: 'POST', // 设置请求方法为 POST
			headers: {
				'Content-Type': 'application/json', // 设置请求头，指定请求体格式为 JSON
			},
			body: JSON.stringify(data), // 将数据转换为 JSON 字符串
		});

		// 处理响应
		if (response.ok) {
			const result = await response.json(); // 将响应解析为 JSON
			console.log('Response data:', result);
			return result; // 返回结果
		} else {
			console.error('Request failed:', response.status);
		}
	} catch (error) {
		console.error('Error:', error); // 捕获并处理错误
	}
};
