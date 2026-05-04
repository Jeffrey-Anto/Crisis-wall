import { PageWrapper } from "../components/PageWrapper";
import { useIncidents } from "../hooks/useIncidents";
import { useResources } from "../hooks/useResources";
import { Card, CardHeader, CardTitle, CardContent } from "../components/Card";
import { Skeleton } from "../components/Skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Activity, Users } from "lucide-react";

export function Analytics() {
  const { incidents, isLoading: incidentsLoading } = useIncidents();
  const { resources, isLoading: resourcesLoading } = useResources();

  const isLoading = incidentsLoading || resourcesLoading;

  // Compute Incident Metrics
  const incidentsBySeverity = [
    { name: 'Low', count: incidents.filter(i => i.severity === 'low').length, fill: '#34d399' },
    { name: 'Medium', count: incidents.filter(i => i.severity === 'medium').length, fill: '#60a5fa' },
    { name: 'High', count: incidents.filter(i => i.severity === 'high').length, fill: '#fb923c' },
    { name: 'Critical', count: incidents.filter(i => i.severity === 'critical').length, fill: '#f87171' }
  ];

  // Compute Resource Metrics
  const resourcesByStatus = [
    { name: 'Available', value: resources.filter(r => r.availability_status === 'available').length, color: '#34d399' },
    { name: 'Deployed', value: resources.filter(r => r.availability_status === 'deployed').length, color: '#60a5fa' },
    { name: 'Maintenance', value: resources.filter(r => r.availability_status === 'maintenance').length, color: '#fb923c' }
  ].filter(d => d.value > 0);

  return (
    <PageWrapper title="Analytics Dashboard" description="Deep dive into crisis metrics and historical data.">
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Incident Severity Chart */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Incidents by Severity</CardTitle>
              <Activity className="h-4 w-4 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={incidentsBySeverity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip 
                      cursor={{ fill: '#1e293b', opacity: 0.5 }}
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                      itemStyle={{ color: '#e2e8f0' }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Resources Status Chart */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Resource Availability</CardTitle>
              <Users className="h-4 w-4 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {resourcesByStatus.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={resourcesByStatus}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {resourcesByStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                        itemStyle={{ color: '#e2e8f0' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500">
                    No resource data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

        </div>
      )}
    </PageWrapper>
  );
}
