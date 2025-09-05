// Mock for next/head
import React from 'react';

const Head = ({ children }) => <>{children}</>;
Head.rewind = () => '';

export default Head;
