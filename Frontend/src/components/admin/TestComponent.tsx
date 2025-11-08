import React from 'react';

const TestComponent = () => {
  console.log('TestComponent rendering...');
  
  return (
    <div className="p-8 bg-blue-100 border-4 border-blue-500">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">🧪 TEST COMPONENT</h1>
      <p className="text-xl text-gray-800 mb-4">If you can see this, React is working!</p>
      <div className="bg-white p-4 rounded border">
        <p className="text-lg">✅ Component rendering</p>
        <p className="text-lg">✅ React working</p>
        <p className="text-lg">✅ TypeScript working</p>
        <p className="text-lg">✅ Tailwind CSS working</p>
      </div>
      <button 
        onClick={() => alert('Button clicked! Everything is working!')}
        className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg text-lg"
      >
        Test Button
      </button>
    </div>
  );
};

export default TestComponent;
