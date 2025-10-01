import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { X, Save, Plus, RefreshCw } from "lucide-react";
import { apiService } from "@/lib/api";

interface GeneratePinResponse {
  status: boolean;
  message: string;
  data: {
    PIN: string;
  };
}

interface Field {
  name: string;
  label: string;
  type: "text" | "email" | "textarea" | "select" | "multiselect" | "number" | "file" | "color";
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  accept?: string;
  generateButton?: boolean;
  generateEndpoint?: string;
}

interface CrudFormProps {
  title: string;
  fields: Field[];
  initialData?: Record<string, unknown>;
  onSubmit: (data: Record<string, unknown>) => void;
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
  const [generating, setGenerating] = useState<string | null>(null);

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      form.reset(initialData);
    }
  }, [initialData, form]);

  const handleSubmit = (data: Record<string, unknown>) => {
    onSubmit(data);
  };

  const generateValue = async (endpoint: string, fieldName: string) => {
    setGenerating(fieldName);
    try {
      const token = localStorage.getItem('auth_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error('Erro ao gerar PIN');
      }

      const data: GeneratePinResponse = await response.json();
      if (data.status && data.data?.PIN) {
        form.setValue(fieldName, data.data.PIN);
      }
    } catch (error) {
      console.error('Erro ao gerar valor:', error);
      alert('Erro ao gerar PIN. Tente novamente.');
    } finally {
      setGenerating(null);
    }
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
                    value={String(formField.value || '')}
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
                <Select onValueChange={formField.onChange} defaultValue={String(formField.value || '')}>
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

      case "multiselect":
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            rules={{ required: field.required && "Este campo é obrigatório" }}
            render={({ field: formField }) => {
              const currentValues = Array.isArray(formField.value) ? formField.value : [];
              
              return (
                <FormItem>
                  <FormLabel>{field.label}</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value) => {
                        if (currentValues.includes(value)) {
                          formField.onChange(currentValues.filter(v => v !== value));
                        } else {
                          formField.onChange([...currentValues, value]);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={field.placeholder || "Selecione as opções"} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options && field.options.length > 0 ? (
                          field.options.map((option) => {
                            const isSelected = currentValues.includes(option.value);
                            return (
                              <SelectItem 
                                key={option.value} 
                                value={option.value}
                                className={isSelected ? "bg-accent" : ""}
                              >
                                {option.label}
                              </SelectItem>
                            );
                          })
                        ) : (
                          <SelectItem value="no-options" disabled>
                            Nenhuma opção disponível
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  {currentValues.length > 0 && field.options && field.options.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {currentValues.map((value: string) => {
                        const option = field.options.find(opt => opt.value === value);
                        return (
                          <span
                            key={value}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary text-primary-foreground"
                          >
                            {option?.label || value}
                            <button
                              type="button"
                              onClick={() => {
                                const newValues = currentValues.filter((v: string) => v !== value);
                                formField.onChange(newValues);
                              }}
                              className="ml-1 text-primary-foreground hover:text-primary-foreground/70"
                            >
                              ×
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              );
            }}
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
                    value={String(formField.value || '')}
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
                  <div className="flex gap-2">
                    <Input
                      type={field.type}
                      placeholder={field.placeholder}
                      {...formField}
                      value={String(formField.value || '')}
                      className="flex-1"
                    />
                    {field.generateButton && field.generateEndpoint && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => generateValue(field.generateEndpoint!, field.name)}
                        className="px-3"
                        title="Gerar PIN"
                        disabled={generating === field.name}
                      >
                        <RefreshCw className={`h-4 w-4 ${generating === field.name ? 'animate-spin' : ''}`} />
                      </Button>
                    )}
                  </div>
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