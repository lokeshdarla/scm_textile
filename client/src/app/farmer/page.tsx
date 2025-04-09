import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DataTable } from './_components/data-table'
export default function Page() {
  return (
    <div className=" p-6 space-y-4">
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid  grid-cols-2 w-[400px]">
          <TabsTrigger value="add-raw-material">Add Raw Material</TabsTrigger>
          <TabsTrigger value="view-transactions">View Transactions</TabsTrigger>
        </TabsList>
        <TabsContent value="add-raw-material">
          <Card className="my-4">
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Make changes to your account here. Click save when you're done.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="name">Name</Label>
                <Input id="name" defaultValue="Pedro Duarte" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="username">Username</Label>
                <Input id="username" defaultValue="@peduarte" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="view-transactions">
          <DataTable />
        </TabsContent>
      </Tabs>
    </div>
  )
}
