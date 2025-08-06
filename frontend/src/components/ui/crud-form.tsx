import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { X, Save, Plus } from "lucide-react";

interface Field {
  name: string;
  label: string;
  type: "text" | "email" | "textarea" | "select" | "number" | "file" | "color";
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  accept?: string;
}

interface CrudFormProps {
  title: string;
  fields: Field[];
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => void;
  onCancel: () => void;
  isEditing?: boolean;
  loading?: boolean;
}

export const CrudForm = ({
  title,
  fields,
  initialData = {},
  onSubmit,
  onCancel,
  isEditing = false,
  loading = false
}: CrudFormProps) => {
  const form = useForm({
    defaultValues: initialData
  });

  const handleSubmit = (data: Record<string, any>) => {
    onSubmit(data);
  };

  const renderField = (field: Field) => {
    switch (field.type) {
      case "textarea":
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            rules={{ required: field.required && "Este campo é obrigatório" }}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={field.placeholder}
                    {...formField}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "select":
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            rules={{ required: field.required && "Este campo é obrigatório" }}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <Select onValueChange={formField.onChange} defaultValue={formField.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={field.placeholder || "Selecione uma opção"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "file":
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            rules={{ required: field.required && "Este campo é obrigatório" }}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept={field.accept}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      formField.onChange(file);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "color":
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            rules={{ required: field.required && "Este campo é obrigatório" }}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  <Input
                    type="color"
                    placeholder={field.placeholder}
                    {...formField}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      default:
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            rules={{ required: field.required && "Este campo é obrigatório" }}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  <Input
                    type={field.type}
                    placeholder={field.placeholder}
                    {...formField}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-ifms-green-dark">
            {isEditing ? "Editar" : "Adicionar"} {title}
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map(renderField)}
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-ifms-green hover:bg-ifms-green-dark" disabled={loading}>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isEditing ? "Salvando..." : "Adicionando..."}
                  </>
                ) : isEditing ? (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}; 