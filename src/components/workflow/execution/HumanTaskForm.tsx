import React, { useState, useEffect } from 'react';
import { FaCheck, FaSpinner } from 'react-icons/fa';

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'checkbox' | 'date' | 'file';
  placeholder?: string;
  defaultValue?: any;
  required?: boolean;
  options?: { label: string; value: any }[];
}

export interface HumanTaskFormProps {
  formFields: FormField[];
  node:any;
  onSubmit: (data: any) => void;
  loading?: boolean;
  title?: string;
  description?: string;
  initialData?: Record<string, any>;
}

const HumanTaskForm: React.FC<HumanTaskFormProps> = ({
  formFields,
  onSubmit,
  loading = false,
  title,
  description,
  initialData = {}
}) => {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  useEffect(() => {
    // Initialize form data with defaults
    const initialFormData: Record<string, any> = { ...initialData };
    
    formFields.forEach(field => {
      // Only set default if field isn't already in initialData
      if (initialData[field.id] === undefined && field.defaultValue !== undefined) {
        initialFormData[field.id] = field.defaultValue;
      }
    });
    
    setFormData(initialFormData);
  }, [formFields, initialData]);
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    // Handle different input types
    let parsedValue: any = value;
    if (type === 'checkbox') {
      parsedValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number') {
      parsedValue = value ? parseFloat(value) : '';
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: parsedValue
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    formFields.forEach(field => {
      // Check required fields
      if (field.required && 
          (formData[field.id] === undefined || 
           formData[field.id] === '' || 
           formData[field.id] === null)
      ) {
        newErrors[field.id] = 'This field is required';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };
  
  // If no form fields defined, show a simple confirmation
  if (!formFields || formFields.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="mb-4">{description || 'Please confirm to continue'}</p>
        <button
          onClick={() => onSubmit({})}
          disabled={loading}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md flex items-center mx-auto"
        >
          {loading ? (
            <>
              <FaSpinner className="mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <FaCheck className="mr-2" />
              Confirm
            </>
          )}
        </button>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {title && <h3 className="text-lg font-medium">{title}</h3>}
      {description && (
        <div className="mb-4 text-sm">{description}</div>
      )}
      
      {formFields.map(field => (
        <FormFieldComponent
          key={field.id}
          field={field}
          value={formData[field.id]}
          onChange={handleChange}
          error={errors[field.id]}
        />
      ))}
      
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md flex items-center"
        >
          {loading ? (
            <>
              <FaSpinner className="mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <FaCheck className="mr-2" />
              Submit
            </>
          )}
        </button>
      </div>
    </form>
  );
};

interface FormFieldComponentProps {
  field: FormField;
  value: any;
  onChange: (e: React.ChangeEvent<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  >) => void;
  error?: string;
}

const FormFieldComponent: React.FC<FormFieldComponentProps> = ({
  field,
  value,
  onChange,
  error
}) => {
  switch (field.type) {
    case 'text':
      return (
        <div>
          <label htmlFor={field.id} className="block text-sm font-medium mb-1">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            id={field.id}
            name={field.id}
            value={value || ''}
            onChange={onChange}
            placeholder={field.placeholder}
            className={`w-full px-3 py-2 border ${
              error ? 'border-red-500' : 'border-border'
            } rounded-md`}
          />
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
      );
      
    case 'textarea':
      return (
        <div>
          <label htmlFor={field.id} className="block text-sm font-medium mb-1">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <textarea
            id={field.id}
            name={field.id}
            value={value || ''}
            onChange={onChange}
            placeholder={field.placeholder}
            className={`w-full px-3 py-2 border ${
              error ? 'border-red-500' : 'border-border'
            } rounded-md`}
            rows={4}
          />
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
      );
      
    case 'number':
      return (
        <div>
          <label htmlFor={field.id} className="block text-sm font-medium mb-1">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="number"
            id={field.id}
            name={field.id}
            value={value || ''}
            onChange={onChange}
            placeholder={field.placeholder}
            className={`w-full px-3 py-2 border ${
              error ? 'border-red-500' : 'border-border'
            } rounded-md`}
          />
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
      );
      
    case 'select':
      return (
        <div>
          <label htmlFor={field.id} className="block text-sm font-medium mb-1">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <select
            id={field.id}
            name={field.id}
            value={value || ''}
            onChange={onChange}
            className={`w-full px-3 py-2 border ${
              error ? 'border-red-500' : 'border-border'
            } rounded-md`}
          >
            <option value="">Select an option</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
      );
      
    case 'checkbox':
      return (
        <div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id={field.id}
              name={field.id}
              checked={value || false}
              onChange={onChange}
              className={`mr-2 ${
                error ? 'border-red-500' : 'border-border'
              }`}
            />
            <label htmlFor={field.id} className="text-sm">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
          </div>
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
      );
      
    case 'date':
      return (
        <div>
          <label htmlFor={field.id} className="block text-sm font-medium mb-1">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="date"
            id={field.id}
            name={field.id}
            value={value || ''}
            onChange={onChange}
            className={`w-full px-3 py-2 border ${
              error ? 'border-red-500' : 'border-border'
            } rounded-md`}
          />
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
      );
      
    case 'file':
      // File inputs need special handling, this is just a placeholder
      return (
        <div>
          <label htmlFor={field.id} className="block text-sm font-medium mb-1">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="file"
            id={field.id}
            name={field.id}
            onChange={onChange}
            className={`w-full px-3 py-2 border ${
              error ? 'border-red-500' : 'border-border'
            } rounded-md`}
          />
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
      );
      
    default:
      return (
        <div>
          <p>Unsupported field type: {field.type}</p>
        </div>
      );
  }
};

export default HumanTaskForm;
