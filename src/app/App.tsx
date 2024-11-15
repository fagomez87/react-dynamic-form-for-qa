import DynamicForm from './components/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { A, B, C } from './schemas';

export default function App() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-4">
            <Tabs defaultValue="A" className="w-[400px]">
                <TabsList>
                    <TabsTrigger value="A">Schema A</TabsTrigger>
                    <TabsTrigger value="B">Schema B</TabsTrigger>
                    <TabsTrigger value="C">Schema C</TabsTrigger>
                </TabsList>
                <TabsContent value="A">
                    <DynamicForm schema={A} />
                </TabsContent>
                <TabsContent value="B">
                    <DynamicForm schema={B} />
                </TabsContent>
                <TabsContent value="C">
                    <DynamicForm schema={C} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
