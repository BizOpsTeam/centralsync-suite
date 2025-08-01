import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const activities = [
  {
    id: 1,
    type: "sale",
    customer: "John Doe",
    amount: "$342.50",
    time: "2 minutes ago",
    status: "completed"
  },
  {
    id: 2,
    type: "payment",
    customer: "Sarah Wilson",
    amount: "$125.00",
    time: "15 minutes ago",
    status: "pending"
  },
  {
    id: 3,
    type: "product",
    customer: "Mike Johnson",
    amount: "Added 50 units",
    time: "1 hour ago",
    status: "updated"
  },
  {
    id: 4,
    type: "campaign",
    customer: "Email Campaign",
    amount: "Sent to 150 customers",
    time: "2 hours ago",
    status: "sent"
  }
];

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-4">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {activity.customer.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {activity.customer}
                </p>
                <p className="text-sm text-muted-foreground">
                  {activity.amount} • {activity.time}
                </p>
              </div>
              <Badge 
                variant={
                  activity.status === "completed" ? "default" :
                  activity.status === "pending" ? "secondary" :
                  activity.status === "sent" ? "outline" : "default"
                }
                className={
                  activity.status === "completed" ? "bg-success text-success-foreground" :
                  activity.status === "pending" ? "bg-warning text-warning-foreground" :
                  ""
                }
              >
                {activity.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}