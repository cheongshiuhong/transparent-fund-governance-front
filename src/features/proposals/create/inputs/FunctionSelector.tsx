// Types
import type { FC, ReactElement } from 'react';
import type { EnumType } from '@interfaces/general';

// Libraries
import { useState, useEffect } from 'react';
import Select from 'react-select';
import { useField } from 'formik';

// Code
import selectStyles from '@components/config/selectStyles';
import { calls } from '@utils/abis';

/**
 * The function selector component.
 *
 * @returns {ReactElement} - The function selector component.
 */
const FunctionSelector: FC = (): ReactElement => {
    const [field, { value }, { setValue }] = useField('function');
    const [options, setOptions] = useState<EnumType<string>[]>([]);

    /** Effect to change the options when contract chosen changes */
    useEffect(() => {
        const options = Object.entries(calls).map(([selector, { functionName }]) => ({
            label: functionName,
            value: selector
        }));

        // Clear selection and reset options
        setValue({ label: '', value: '' });
        setOptions(options);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div>
            <label htmlFor="function-selector" className="font-semibold">
                Function
            </label>
            <Select
                id="function-selector"
                aria-label="function-selector"
                placeholder="Function"
                name={field.name}
                options={options}
                value={value}
                onChange={(value: EnumType<string>) => setValue(value)}
                styles={selectStyles}
                closeMenuOnSelect
                isClearable={false}
            />
        </div>
    );
};

export default FunctionSelector;
