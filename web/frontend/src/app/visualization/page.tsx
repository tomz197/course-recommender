'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import Plot from 'react-plotly.js';
import { Data, Layout, Config } from 'plotly.js';
import type { DataPoint } from '@/assets/tsne_visualization_data';
import { AlertCircle, ExternalLink, Filter, Maximize2, Search, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { filterCourses } from '@/hooks/use-search-courses';
import { LoadingSpinner } from '@/components/loading-spinner';

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
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <VisualizationPageInner />
    </Suspense>
  );
}

const { tsne_data } = await import('@/assets/tsne_visualization_data');

function VisualizationPageInner() {
  const [showDescription, setShowDescription] = useState(true);

  return (
    <div className="container mx-auto py-6 flex flex-col gap-4 px-4">
      <Alert variant="destructive" className='md:hidden'>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Small screen detected</AlertTitle>
        <AlertDescription>
            This visualization is not optimized for small screens. Please use a larger device for the best experience.
        </AlertDescription>
      </Alert>

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
              Shape similarity with Czech Republic is purely coincidental. It can be attributed only to divine intervention.
            </p>
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

      <CourseVisualization />

      {/* Instructions */}
      <div className="text-sm text-muted-foreground">
        <p>• Use mouse wheel  to zoom in/out</p>
        <p>• Click and drag or touch and drag to pan</p>
        <p>• Double tap to reset zoom</p>
        <p>• Click on points to see details</p>
        <p>• Use the search box to filter courses</p>
        <p>• Use the dropdown to filter by faculty</p>
        <p>• Click on legend items to toggle faculty visibility</p>
      </div>
    </div>
  );
} 

function CourseVisualization() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('All');
  const [selectedPoint, setSelectedPoint] = useState<DataPoint | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (isFullscreen) {
      window.scrollTo(0, 0);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isFullscreen]);

  // Memoize filtered data
  const filteredCodes = useMemo(() => {
    if (searchTerm === '' && selectedFaculty === 'All') {
      return new Set();
    }
    let filteredData = filterCourses(searchTerm);

    if (selectedFaculty !== 'All') {
      filteredData = filteredData.filter(d => d.FACULTY === selectedFaculty);
    }

    const filteredCodes = new Set(filteredData.map(d => `${d.FACULTY}-${d.CODE}`));

    return filteredCodes;
  }, [searchTerm, selectedFaculty]);

  // Memoize traces
  const traces: Data[] = useMemo(() => {
    return faculties
      .filter(f => f !== 'All')
      .map(faculty => {
        const facultyData = tsne_data.filter((d: DataPoint) => d.faculty === faculty);
        const opacity = (() => {
          if (filteredCodes.size <= 0 && selectedFaculty === 'All') {
            return new Array(facultyData.length).fill(0.5);
          }

          return facultyData.map((d: DataPoint) => {
            return filteredCodes.has(`${d.faculty}-${d.code}`) ? 0.75 : 0.05;
          })
        })();

        const lineColor = (() => {
          if (filteredCodes.size <= 0 && selectedFaculty === 'All') {
            return undefined;
          }

          return facultyData.map((d: DataPoint) => {
            return filteredCodes.has(`${d.faculty}-${d.code}`) ? '#000000' : '#ffffff';
          })
        })();

        return {
          x: facultyData.map((d: DataPoint) => d.x),
          y: facultyData.map((d: DataPoint) => d.y),
          mode: 'markers' as const,
          type: 'scattergl' as const,
          name: faculty,
          marker: {
            size: facultyData.map((d: DataPoint) => Math.max(3, Math.sqrt(Math.min(500, Math.max(0, d.studentCount))))),
            color: getFacultyColor(faculty),
            opacity: opacity,
            line: {
              color: lineColor,
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
      zeroline: false,
      showticklabels: false
    },
    yaxis: {
      title: '',
      showgrid: true,
      zeroline: false,
      showticklabels: false
    }
  }), []);

  // Memoize config
  const config: Partial<Config> = useMemo(() => ({
    responsive: true,
    scrollZoom: true,
    displayModeBar: true,
    modeBarButtonsToAdd: ['zoom2d', 'pan2d', 'resetScale2d'] as const,
    modeBarButtonsToRemove: ['lasso2d', 'select2d'] as const,
    touchZoom: true,
    doubleClick: 'reset+autosize'
  }), []);

  return (
    <div className={`flex flex-1 flex-col gap-4 ${isFullscreen ? 'absolute inset-0 z-50 bg-background p-4 left-0 top-0 right-0 bottom-0' : ''}`}>
      {/* Filters */}
      <div className="flex gap-4 max-w-screen-lg mx-auto w-full">
        <Select onValueChange={(value) => setSelectedFaculty(value)}>
          <SelectTrigger className="w-[150px]">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Faculty" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {faculties.map((faculty) => (
              <SelectItem key={faculty} value={faculty}>
                {faculty === 'All' ? 'All faculties' : faculty}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by course name or code ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          onClick={() => setIsFullscreen(!isFullscreen)}
          size="icon"
        >
          {isFullscreen ? <X className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </Button>
      </div>

      {/* Visualization container */}
      <div className={`relative border rounded-lg overflow-hidden p-2 flex flex-1 min-h-[600px] aspect-video mx-auto`}>
        <Plot
          data={traces as Data[]}
          layout={layout}
          config={config}
          className={`w-full h-full aspect-video mx-auto ${isFullscreen ? 'flex-1' : 'max-h-[80vh]'}`}
          key={`plot-${isFullscreen}`}
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
    </div>
  )
}