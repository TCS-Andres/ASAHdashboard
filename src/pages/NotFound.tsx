import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-background p-6">
    <div className="text-center space-y-3">
      <h1 className="text-4xl font-bold text-foreground">404</h1>
      <p className="text-muted-foreground">That page doesn't exist.</p>
      <Link to="/overview" className="text-primary hover:underline">
        Back to Executive Overview
      </Link>
    </div>
  </div>
);

export default NotFound;
