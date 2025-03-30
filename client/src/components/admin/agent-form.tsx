import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertAgentSchema, Agent } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const categories = [
  "Data Analysis",
  "Content Creation",
  "Customer Support",
  "Development",
  "Finance",
  "Marketing",
  "Research",
  "Sales",
  "Other"
];

const iconClasses = [
  { value: "bx-line-chart", label: "Analytics" },
  { value: "bx-code-block", label: "Code" },
  { value: "bx-chat", label: "Chat" },
  { value: "bx-data", label: "Data" },
  { value: "bx-envelope", label: "Email" },
  { value: "bx-search", label: "Search" },
  { value: "bx-file", label: "Document" },
  { value: "bx-image", label: "Image" },
  { value: "bx-money", label: "Finance" },
  { value: "bx-calendar", label: "Calendar" }
];

const iconBgClasses = [
  { value: "bg-blue-100", label: "Blue" },
  { value: "bg-green-100", label: "Green" },
  { value: "bg-purple-100", label: "Purple" },
  { value: "bg-red-100", label: "Red" },
  { value: "bg-yellow-100", label: "Yellow" },
  { value: "bg-indigo-100", label: "Indigo" },
  { value: "bg-pink-100", label: "Pink" },
  { value: "bg-gray-100", label: "Gray" }
];

const gradientClasses = [
  { value: "from-blue-500 to-indigo-500", label: "Blue to Indigo" },
  { value: "from-green-500 to-teal-500", label: "Green to Teal" },
  { value: "from-purple-500 to-indigo-500", label: "Purple to Indigo" },
  { value: "from-red-500 to-pink-500", label: "Red to Pink" },
  { value: "from-yellow-500 to-orange-500", label: "Yellow to Orange" },
  { value: "from-indigo-500 to-purple-500", label: "Indigo to Purple" },
  { value: "from-pink-500 to-rose-500", label: "Pink to Rose" },
  { value: "from-gray-500 to-slate-500", label: "Gray to Slate" }
];

// Extended schema for form validation
const agentFormSchema = insertAgentSchema.extend({
  price: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(0, "Price must be a positive number")
  ),
});

type AgentFormValues = z.infer<typeof agentFormSchema>;

interface AgentFormProps {
  agent?: Agent;
  isSubmitting: boolean;
  onSubmit: (data: AgentFormValues) => void;
}

export default function AgentForm({ agent, isSubmitting, onSubmit }: AgentFormProps) {
  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: agent ? {
      ...agent,
      price: agent.price / 100, // Convert from cents to dollars for display
    } : {
      name: "",
      description: "",
      price: 0,
      category: "Other",
      features: "",
      isPopular: false,
      isNew: true,
      isEnterprise: false,
      iconClass: "bx-bot",
      iconBgClass: "bg-blue-100",
      gradientClass: "from-blue-500 to-indigo-500",
    }
  });

  const handleSubmit = (data: AgentFormValues) => {
    // Convert price from dollars to cents
    const formattedData = {
      ...data,
      price: Math.round(data.price * 100),
    };
    onSubmit(formattedData);
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <Label htmlFor="name">Agent Name</Label>
          <Input
            id="name"
            {...form.register("name")}
            className="mt-1"
            placeholder="e.g. Content Writer Assistant"
          />
          {form.formState.errors.name && (
            <p className="mt-1 text-sm text-red-600">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Select
            defaultValue={form.getValues("category")}
            onValueChange={(value) => form.setValue("category", value)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.category && (
            <p className="mt-1 text-sm text-red-600">{form.formState.errors.category.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...form.register("description")}
          className="mt-1"
          rows={3}
          placeholder="Describe what this agent does..."
        />
        {form.formState.errors.description && (
          <p className="mt-1 text-sm text-red-600">{form.formState.errors.description.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="features">Features (comma-separated list)</Label>
        <Textarea
          id="features"
          {...form.register("features")}
          className="mt-1"
          rows={2}
          placeholder="e.g. SEO optimization, grammar checking, content creation"
        />
        {form.formState.errors.features && (
          <p className="mt-1 text-sm text-red-600">{form.formState.errors.features.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div>
          <Label htmlFor="price">Price ($) per month</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            {...form.register("price", { valueAsNumber: true })}
            className="mt-1"
            placeholder="9.99"
          />
          {form.formState.errors.price && (
            <p className="mt-1 text-sm text-red-600">{form.formState.errors.price.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="iconClass">Icon</Label>
          <Select
            defaultValue={form.getValues("iconClass")}
            onValueChange={(value) => form.setValue("iconClass", value)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select an icon" />
            </SelectTrigger>
            <SelectContent>
              {iconClasses.map((icon) => (
                <SelectItem key={icon.value} value={icon.value}>
                  <div className="flex items-center">
                    <i className={`bx ${icon.value} mr-2`}></i>
                    <span>{icon.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="iconBgClass">Icon Background</Label>
          <Select
            defaultValue={form.getValues("iconBgClass")}
            onValueChange={(value) => form.setValue("iconBgClass", value)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select a background color" />
            </SelectTrigger>
            <SelectContent>
              {iconBgClasses.map((bg) => (
                <SelectItem key={bg.value} value={bg.value}>
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full ${bg.value} mr-2`}></div>
                    <span>{bg.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="gradientClass">Header Gradient</Label>
        <Select
          defaultValue={form.getValues("gradientClass")}
          onValueChange={(value) => form.setValue("gradientClass", value)}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select a gradient" />
          </SelectTrigger>
          <SelectContent>
            {gradientClasses.map((gradient) => (
              <SelectItem key={gradient.value} value={gradient.value}>
                <div className="flex items-center">
                  <div className={`w-8 h-4 rounded bg-gradient-to-r ${gradient.value} mr-2`}></div>
                  <span>{gradient.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isNew"
            checked={form.watch("isNew") || false}
            onCheckedChange={(checked) => form.setValue("isNew", checked === true)}
          />
          <Label htmlFor="isNew">Mark as New</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="isPopular"
            checked={form.watch("isPopular") || false}
            onCheckedChange={(checked) => form.setValue("isPopular", checked === true)}
          />
          <Label htmlFor="isPopular">Mark as Popular</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="isEnterprise"
            checked={form.watch("isEnterprise") || false}
            onCheckedChange={(checked) => form.setValue("isEnterprise", checked === true)}
          />
          <Label htmlFor="isEnterprise">Mark as Enterprise</Label>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {agent ? "Updating..." : "Creating..."}
            </>
          ) : (
            agent ? "Update Agent" : "Create Agent"
          )}
        </Button>
      </div>
    </form>
  );
}