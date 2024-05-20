import React, { useState, useEffect } from 'react';
import { Table, Card, Row, Col } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto'; // 
import './CsvDataComponent.css'; // 

interface DataType {
  key: string;
  year: string;
  totalJobs: number;
  avgSalaryUSD: number;
}

interface JobTitleData {
  title: string;
  count: number;
}

interface RawJobTitleData {
  year: string;
  title: string;
}

const CsvDataComponent: React.FC = () => {
  const [data, setData] = useState<DataType[]>([]);
  const [jobTitleData, setJobTitleData] = useState<RawJobTitleData[]>([]);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('./salaries.csv');
        const csvText = await response.text();

        const rows: string[][] = csvText.split('\n').map(row => row.split(','));
        const header = rows[0];
        const yearIndex = header.indexOf("work_year");
        const titleIndex = header.indexOf("job_title");
        const salaryIndex = header.indexOf("salary_in_usd");

        const newData: DataType[] = rows.slice(1).map((row, index) => ({
          key: `${index}`,
          year: row[yearIndex] || '',
          totalJobs: 1,
          avgSalaryUSD: parseFloat(row[salaryIndex]) || 0,
        }));

        const aggregatedData = newData.reduce((acc, curr) => {
          const existing = acc.find(item => item.year === curr.year);
          if (existing) {
            existing.totalJobs += 1;
            existing.avgSalaryUSD += curr.avgSalaryUSD;
          } else {
            acc.push({ ...curr });
          }
          return acc;
        }, [] as DataType[]);

        aggregatedData.forEach(item => {
          item.avgSalaryUSD = item.avgSalaryUSD / item.totalJobs;
        });

        setData(aggregatedData);

        const jobTitleData: RawJobTitleData[] = rows.slice(1).map(row => ({
          year: row[yearIndex],
          title: row[titleIndex],
        }));

        setJobTitleData(jobTitleData);
      } catch (error) {
        console.error('Error fetching or parsing CSV:', error);
      }
    };

    fetchData();
  }, []);

  const columns: ColumnsType<DataType> = [
    {
      title: 'Year',
      dataIndex: 'year',
      key: 'year',
      sorter: (a, b) => a.year.localeCompare(b.year),
      onCell: (record) => ({
        onClick: () => handleRowClick(record.year),
      }),
    },
    {
      title: 'Total Jobs',
      dataIndex: 'totalJobs',
      key: 'totalJobs',
      sorter: (a, b) => a.totalJobs - b.totalJobs,
    },
    {
      title: 'Average Salary (USD)',
      dataIndex: 'avgSalaryUSD',
      key: 'avgSalaryUSD',
      sorter: (a, b) => a.avgSalaryUSD - b.avgSalaryUSD,
    },
  ];

  const handleRowClick = (year: string) => {
    setSelectedYear(year);
  };

  const selectedYearData = jobTitleData.filter(item => item.year === selectedYear);
  const aggregatedJobTitleData = selectedYearData.reduce((acc, curr) => {
    const existing = acc.find(item => item.title === curr.title);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ title: curr.title, count: 1 });
    }
    return acc;
  }, [] as JobTitleData[]);

  const jobTitleColumns: ColumnsType<JobTitleData> = [
    {
      title: 'Job Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Count',
      dataIndex: 'count',
      key: 'count',
    },
  ];

  const lineChartData = {
    labels: data.map(item => item.year),
    datasets: [
      {
        label: 'Average Salary (USD)',
        data: data.map(item => item.avgSalaryUSD),
        fill: false,
        backgroundColor: 'blue',
        borderColor: 'blue',
      },
      {
        label: 'Total Jobs',
        data: data.map(item => item.totalJobs),
        fill: false,
        backgroundColor: 'red',
        borderColor: 'red',
      },
    ],
  };

  return (
    <div className="csv-data-container">
      <Row justify="center" style={{ marginBottom: '20px' }}>
        <Col span={24}>
          <Card title="Main Table" bordered={false}>
            <Table 
              columns={columns} 
              dataSource={data} 
              pagination={{ pageSize: 10 }} 
              rowClassName="table-row" 
              className="csv-data-table" 
            />
          </Card>
        </Col>
      </Row>
      {selectedYear && (
        <Row justify="center" style={{ marginBottom: '20px' }}>
          <Col span={24}>
            <Card title={`Job Titles for ${selectedYear}`} bordered={false}>
              <Table 
                columns={jobTitleColumns} 
                dataSource={aggregatedJobTitleData} 
                pagination={{ pageSize: 10 }} 
                rowClassName="table-row" 
                className="csv-data-table" 
              />
            </Card>
          </Col>
        </Row>
      )}
      <Row justify="center">
        <Col span={24}>
          <Card title="Average Salary and Total Jobs Over Time" bordered={false}>
            <Line data={lineChartData} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CsvDataComponent;
