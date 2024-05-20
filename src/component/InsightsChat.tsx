import React, { useState } from 'react';
import { Input, Button, Card } from 'antd';
import './InsightsChat.css';

const OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY'; // Replace this with your OpenAI API key

const InsightsChat = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');

  const handleSend = async () => {
    try {
      const response = await fetch('https://api.openai.com/v1/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'text-davinci-003',
          prompt: `You are an expert data analyst. Use the following data to provide business insights: ${query}`,
          max_tokens: 150,
        }),
      });
      
      const data = await response.json();
      setResponse(data.choices[0].text);
    } catch (error) {
      console.error('Error fetching data from OpenAI:', error);
      setResponse('An error occurred while fetching the response.');
    }
  };

  return (
    <div className="insights-chat-container">
      <Card title="Kaggle Insights Chat" bordered={false} style={{ width: 600 }}>
        <Input.TextArea
          rows={4}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask about the data insights..."
        />
        <Button type="primary" onClick={handleSend} style={{ marginTop: '10px' }}>
          Send
        </Button>
        {response && (
          <Card type="inner" title="Response" style={{ marginTop: '20px' }}>
            <p>{response}</p>
          </Card>
        )}
      </Card>
    </div>
  );
};

export default InsightsChat;
