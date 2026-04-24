import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';

export function BackButton() {
  const navigate = useNavigate();
  return (
    <Button variant="ghost" className="mb-4 -ml-4" onClick={() => navigate(-1)}>
      <ArrowLeft className="mr-2 h-4 w-4" /> Back
    </Button>
  );
}