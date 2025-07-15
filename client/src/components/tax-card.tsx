import { Card, CardContent } from "@/components/ui/card";

interface TaxCardItem {
  label: string;
  value: string;
  isHighlighted?: boolean;
}

interface TaxCardProps {
  title: string;
  icon: "receipt" | "home" | "bolt";
  iconColor: "primary" | "success" | "warning";
  items: TaxCardItem[];
  status: string;
  statusColor: "success" | "warning" | "error";
}

const iconMap = {
  receipt: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  home: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  bolt: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
};

const iconColorMap = {
  primary: "text-primary-800 bg-primary-100",
  success: "text-green-600 bg-green-100",
  warning: "text-yellow-600 bg-yellow-100",
};

const statusColorMap = {
  success: "text-green-600",
  warning: "text-yellow-600",
  error: "text-red-600",
};

const statusIconMap = {
  success: (
    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  error: (
    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  ),
};

export default function TaxCard({ title, icon, iconColor, items, status, statusColor }: TaxCardProps) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <div className={`p-2 rounded-full ${iconColorMap[iconColor]}`}>
            {iconMap[icon]}
          </div>
        </div>
        
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex justify-between">
              <span className="text-gray-600">{item.label}</span>
              <span className={`font-semibold ${item.isHighlighted ? 'text-red-600' : ''}`}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className={`flex items-center text-sm ${statusColorMap[statusColor]}`}>
            {statusIconMap[statusColor]}
            <span>{status}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
