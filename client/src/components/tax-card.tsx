import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

export default function TaxCard({ title, icon, iconColor, items, status, statusColor }: TaxCardProps) {
  const iconMap = {
    receipt: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    home: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m0 0V10a1 1 0 011-1h2a1 1 0 011 1v11m0 0h3a1 1 0 001-1V10m-9 0h6" />
      </svg>
    ),
    bolt: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )
  };

  const iconColorClasses = {
    primary: "text-blue-600 bg-blue-100",
    success: "text-green-600 bg-green-100",
    warning: "text-yellow-600 bg-yellow-100"
  };

  const statusColorClasses = {
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800"
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${iconColorClasses[iconColor]}`}>
              {iconMap[icon]}
            </div>
            <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
          </div>
          <Badge className={statusColorClasses[statusColor]} variant="secondary">
            {status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pb-20">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{item.label}</span>
            <span className={`text-sm font-medium ${item.isHighlighted ? 'text-primary-800 font-semibold' : 'text-gray-900'}`}>
              {item.value}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}