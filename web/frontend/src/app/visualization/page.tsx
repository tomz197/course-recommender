'use client';

import { useState, useMemo } from 'react';
import Plot from 'react-plotly.js';
import { Data, Layout, Config } from 'plotly.js';
import type { DataPoint } from '@/assets/tsne_visualization_data';
import { AlertCircle, ExternalLink, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const { tsne_data } = await import('@/assets/tsne_visualization_data');

const getFacultyColor = (faculty: string) => ({
  'FI': '#f2d45c',
  'FF': '#4bc8ff',
  'FSS': '#008c78',
  'ESF': '#b9006e',
  'PrF': '#9100dc',
  'LF': '#f01928',
  'PdF': '#ff7300',
  'FaF': '#56788d',
  'FSpS': '#5ac8af',
  'CST': '#0031e7',
  'PřF': '#00af3f'
})[faculty] || '#000000';

const faculties = [
  'All',
  'FI',
  'FF',
  'FSS',
  'ESF',
  'PrF',
  'LF',
  'PdF',
  'FaF',
  'FSpS',
  'CST',
  'PřF'
];

export default function VisualizationPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('All');
  const [selectedPoint, setSelectedPoint] = useState<DataPoint | null>(null);
  const [showDescription, setShowDescription] = useState(true);

  // Memoize filtered data
  const filteredCodes = useMemo(() => {
    const filteredData = tsne_data.filter(d => {
      const matchesSearch = !searchTerm || 
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.faculty.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFaculty = selectedFaculty === 'All' || d.faculty === selectedFaculty;
      
      return matchesSearch && matchesFaculty;
    });

    const filteredCodes = new Set(filteredData.map(d => `${d.faculty}-${d.code}`));

    return filteredCodes;
  }, [searchTerm, selectedFaculty]);

  // Memoize traces
  const traces: Data[] = useMemo(() => {
    return faculties
      .filter(f => f !== 'All')
      .map(faculty => {
        const facultyData = tsne_data.filter((d: DataPoint) => d.faculty === faculty);
        return {
          x: facultyData.map((d: DataPoint) => d.x),
          y: facultyData.map((d: DataPoint) => d.y),
          mode: 'markers' as const,
          type: 'scattergl' as const,
          name: faculty,
          marker: {
            size: facultyData.map((d: DataPoint) => Math.max(2, Math.sqrt(Math.min(500, Math.max(0, d.studentCount))))),
            color: getFacultyColor(faculty),
            opacity: filteredCodes.size < tsne_data.length
            ? facultyData.map((d: DataPoint) => {
              return filteredCodes.has(`${d.faculty}-${d.code}`) ? 0.75 : 0.1;
            }) : new Array(facultyData.length).fill(0.5),
            line: {
              color: filteredCodes.size < tsne_data.length
              ? facultyData.map((d: DataPoint) => filteredCodes.has(`${d.faculty}-${d.code}`) ? '#000000' : '#ffffff')
              : undefined,
              width: 0.5
            }
          },
          hoveron: 'points',
          hovermode: 'closest',
          hoverdistance: 2,
          spikedistance: 2,
          text: facultyData.map((d: DataPoint) => `${d.name}<br>${d.code}<br>Faculty: ${d.faculty}<br>Students: ${d.studentCount}`),
        };
      });
  }, [filteredCodes, selectedFaculty]);

  // Memoize layout
  const layout: Partial<Layout> = useMemo(() => ({
    title: 'Course Visualization',
    showlegend: true,
    legend: {
      x: 1,
      xanchor: 'right',
      y: 1
    },
    hovermode: 'closest' as const,
    dragmode: 'pan' as const,
    modebar: {
      orientation: 'v'
    },
    margin: {
      l: 50,
      r: 50,
      b: 50,
      t: 50,
      pad: 4
    },
    xaxis: {
      title: '',
      showgrid: true,
      zeroline: false
    },
    yaxis: {
      title: '',
      showgrid: true,
      zeroline: false
    }
  }), []);

  // Memoize config
  const config: Partial<Config> = useMemo(() => ({
    responsive: true,
    scrollZoom: true,
    displayModeBar: true,
    modeBarButtonsToAdd: ['zoom2d', 'pan2d', 'resetScale2d'] as const,
    modeBarButtonsToRemove: ['lasso2d', 'select2d'] as const
  }), []);

  return (
    <div className="container mx-auto py-6 grid grid-cols-1 gap-4">
      <div>
        <h1 className="text-2xl font-bold mb-4">Course Visualization</h1>
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-lg font-semibold">About this Visualization</h2>
          <button 
            onClick={() => setShowDescription(!showDescription)}
            className="text-sm text-muted-foreground"
          >
            {showDescription ? 'Show less' : 'Show more'}
          </button>
        </div>
        {showDescription && (
          <>
            <p className="mb-2">
              Each point represents a course, with the <strong>size</strong> indicating the number of students 
              enrolled and the <strong>color</strong> representing the faculty. Courses that appear closer together 
              in this visualization have similar content based on their course descriptions.
            </p>
            <p>
              The dimensions themselves are abstract, but the spatial relationships are meaningful - 
              courses clustered together are more similar to each other. This can help you discover 
              related courses across different faculties or identify unique interdisciplinary offerings.
            </p>
          </>
        )}
      </div>

      <Alert variant="destructive" className='md:hidden'>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Small screen detected</AlertTitle>
        <AlertDescription>
            This visualization is not optimized for small screens. Please use a larger device for the best experience.
        </AlertDescription>
      </Alert>

      {/* Filters */}
      <div className="flex gap-4">
        <Input
          type="text"
          placeholder="Search by course name, code, or faculty..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select onValueChange={(value) => setSelectedFaculty(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Faculty" />
          </SelectTrigger>
          <SelectContent>
            {faculties.map((faculty) => (
              <SelectItem key={faculty} value={faculty}>
                {faculty}
              </SelectItem>
            ))}
        </SelectContent>
        </Select>
      </div>

      {/* Visualization container */}
      <div className="relative border rounded-lg overflow-hidden">
        <Plot
          data={traces as Data[]}
          layout={layout}
          config={config}
          className="w-full h-[800px] max-h-[80vh]"
          onClick={(event: Plotly.PlotMouseEvent) => {
            if (event.points && event.points[0]) {
              const traceIndex = event.points[0].curveNumber;
              const pointIndex = event.points[0].pointIndex;
              const faculty = faculties[traceIndex + 1]; // +1 because 'All' is at index 0
              const facultyData = tsne_data.filter((d: DataPoint) => d.faculty === faculty);
              setSelectedPoint(facultyData[pointIndex]);
            }
          }}
        />
        
        {/* Tooltip */}
        {selectedPoint && (
          <div
            className="absolute bg-background p-4 rounded-lg shadow-lg border z-50"
            style={{
              left: '20px',
              top: '20px',
              maxWidth: '300px',
            }}
          >
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm">{selectedPoint.name}</h3>
              <button 
                onClick={() => setSelectedPoint(null)} 
                className="ml-2 p-1 rounded-full hover:bg-gray-100"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm">Code: {selectedPoint.code}</p>
            <p className="text-sm">Faculty: {selectedPoint.faculty}</p>
            <p className="text-sm">Students: {selectedPoint.studentCount}</p>
            <a
              href={`https://is.muni.cz/predmet/${
                selectedPoint.faculty === "P\u0159F" ? "sci" : selectedPoint.faculty
              }/${selectedPoint.code}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center hover:underline text-sm text-blue-500 hover:text-blue-600"
              >
              View in IS MU <ExternalLink className="h-4 w-4 ml-1" />
            </a>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="text-sm text-gray-600">
        <p>• Use mouse wheel to zoom in/out</p>
        <p>• Click and drag to pan</p>
        <p>• Click on points to see details</p>
        <p>• Use the search box to filter courses</p>
        <p>• Use the dropdown to filter by faculty</p>
        <p>• Click on legend items to toggle faculty visibility</p>
      </div>
    </div>
  );
} 