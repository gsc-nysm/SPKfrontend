<template>
    <el-dialog
        :title="modalTitle"
        v-model="visible"
        class="lg:w-[25rem] md:w-[25rem] w-full"
        :before-close="handleClose"
        @keydown.enter="handleEnterKey"
        center
    >
        <div :class="mode !== 'show' && mode !== 'delete' && mode !== 'multi-delete' ? 'max-h-[25rem] overflow-y-auto' : ''">
            <template v-if="mode === 'show'">
                <el-descriptions :column="1" border>
                    <el-descriptions-item
                    v-for="field in showFieldsToDisplay"
                    :key="field.prop"
                    :label="field.label"
                    >
                    <slot :name="`show-${field.prop}`" :row="data">
                        <div v-if="field.type === 'image'">
                            <el-image
                                v-if="getFieldValue(field)"
                                :src="getImageUrl(field)"
                                style="width: 100px; height: 100px"
                                fit="cover"
                                :preview-src-list="[getImageUrl(field)]"
                                preview-teleported
                            >
                                <template #error>
                                    <div class="image-slot">Gambar tidak ditemukan</div>
                                </template>
                            </el-image>
                            <span v-else>Tidak ada gambar</span>
                        </div>
                            <!-- Jika tipe adalah file -->
                        <div v-else-if="field.type === 'file'">
                            <a
                                v-if="getFieldValue(field)"
                                :href="getFileUrl(field)"
                                target="_blank"
                                class="text-blue-500 underline btn"
                            >
                                Unduh File
                            </a>
                            <span v-else>Tidak ada file</span>
                        </div>                  
                        <span v-else>
                        <!-- Jika ada fungsi value, panggil fungsi tersebut; jika tidak, gunakan data[field.prop] -->
                        {{ field.value ? field.value(data) : data[field.prop] }}
                        </span>
                    </slot>
                    </el-descriptions-item>
                </el-descriptions>
            </template>
            <template v-else-if="mode === 'delete' || mode === 'multi-delete'">
                <p v-if="mode === 'delete'">Apakah kamu yakin ingin menghapus data ini?</p>
                <!-- <p v-if="mode === 'delete'"><strong>{{ data?.nama || 'Data' }}</strong></p> -->
                <p v-if="mode === 'multi-delete'">Apakah kamu yakin ingin menghapus {{ selectedIds?.length }} instansi terpilih?</p>
                <p v-if="mode === 'multi-delete'" class="text-sm text-gray-500">Data yang dihapus tidak dapat dikembalikan.</p>
            </template>
            <template v-else>
                <el-form
                    :model="formData"
                    :rules="formRules"
                    ref="formRef"
                    :label-width="120"
                >
                    <el-form-item
                        v-for="field in formFields"
                        :key="field.prop"
                        :label="field.label"
                        :prop="field.prop"
                        label-position="top"
                    >
                        <el-input
                            v-if="field.type === 'text' || field.type === 'textarea'"
                            v-model="formData[field.prop]"
                            :type="field.type === 'textarea' ? 'textarea' : 'text'"
                            :placeholder="`Masukkan ${field.label.toLowerCase()}`"
                        />
                        <el-date-picker
                            v-else-if="field.type === 'date'"
                            v-model="formData[field.prop]"
                            class="!w-full"
                            type="date"
                            :placeholder="`Masukkan ${field.label.toLowerCase()}`"
                            @change="handleDateChange(field.prop)"
                        />
                        <el-date-picker
                            v-else-if="field.type === 'year'"
                            v-model="formData[field.prop]"
                            type="year"
                            class="!w-full"
                            :placeholder="`Masukkan ${field.label.toLowerCase()}`"
                            @change="handleYearChange(field.prop)"
                            
                        />
                        <el-switch
                            v-else-if="field.type === 'boolean'"
                            v-model="formData[field.prop]"
                            size="large"
                            active-text="Ya"
                            :active-value="1"
                            :inactive-value="0"
                            inactive-text="Tidak"
                        />
                        <el-select
                            v-else-if="field.type === 'select'"
                            v-model="formData[field.prop]"
                            :placeholder="`Pilih ${field.label.toLowerCase()}`"
                        >
                            <el-option
                            v-for="option in field.options || []"
                            :key="String(option.value)"
                            :label="option.label"
                            :value="option.value"
                            />
                        </el-select>
                        <el-radio-group v-else-if="field.type === 'radio'" v-model="formData[field.prop]">
                            <el-radio-button :value="option.value" size="default" v-for="option in field.options || []" :key="option.value" :label="option.value" border>{{option.label}}</el-radio-button>                            
                        </el-radio-group>
                        <el-upload
                            v-else-if="field.type === 'file'"
                            class="upload-demo w-full h-50"
                            drag
                            action="#"
                            :auto-upload="false"
                            :on-change="(file: any, fileList: any) => handleFileChange(file, fileList, field)"
                            :file-list="getFileList(field.prop)"
                            :accept="field.allowedFormats ? getAcceptValue(field.allowedFormats) : ''"
                            :before-upload="(file: any) => beforeFileUpload(file, field)"
                        >
                            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                            <div class="el-upload__text">
                                Drop file here or <em>click to upload</em>
                            </div>
                            <template #tip>
                                <div class="el-upload__tip">
                                    Hanya file {{ field.allowedFormats?.join(', ') || 'tertentu' }} yang diizinkan, maksimal {{ field.maxSize || 5 }}MB.
                                </div>
                            </template>
                        </el-upload>
                        <!-- Preview untuk berbagai tipe file -->
                        <template v-if="field.type === 'file' && formData[field.prop] && typeof formData[field.prop] === 'string'">
                            <el-image
                                v-if="isImageFile(formData[field.prop])"
                                :src="url + formData[field.prop]"
                                style="width: 100px;"
                                :preview-src-list="[url + formData[field.prop]]"
                            />
                            <a
                                v-else-if="isPDFFile(formData[field.prop])"
                                :href="url + formData[field.prop]"
                                target="_blank"
                                class="el-link el-link--primary"
                            >
                                <el-icon><Document /></el-icon>
                                Lihat File
                            </a>
                            <span v-else>{{ formData[field.prop] }}</span>
                        </template>
                    </el-form-item>
                </el-form>
            </template>
        </div>
        <template #footer>
            <span class="dialog-footer">
            <el-button @click="handleClose" class="mr-2">{{ mode !== 'show' ? 'Batal' : 'Tutup' }}</el-button>
            <el-button
                v-if="mode === 'delete' || mode === 'multi-delete'"
                type="danger"
                @click="handleDeleteAction"
                :loading="loading"
                native-type="submit"
                ref="submitButtonDelete"
                autofocus
            >
                Hapus
            </el-button>
            <el-button
                v-else-if="mode === 'create' || mode === 'update'"
                type="primary"
                @click="handleAction"
                :loading="loading"
                native-type="submit"
                ref="submitButtonSave"
                autofocus
            >
                {{ actionButtonText }}
            </el-button>
            </span>
        </template>
    </el-dialog>
</template>
<script lang="ts" setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import type { FormInstance, UploadFile, FormRules, ElButton } from 'element-plus'
import { ElNotification, ElImage } from 'element-plus'
import type { AxiosResponse } from 'axios'
import { UploadFilled, Document } from '@element-plus/icons-vue'
import { format } from 'date-fns';
const url = import.meta.env.VITE_API_BASE_URL + 'storage/'

const props = defineProps<{
visible: boolean
name: string
mode: 'create' | 'update' | 'show' | 'delete' | 'multi-delete'
data: any | null // Data asli yang mungkin berisi id
selectedIds?: number[]
formFields: {
    prop: string
    label: string
    type?: 'text' | 'textarea' | 'select' | 'file' | 'date' | 'year' | 'boolean' | 'radio'
    options?: { label: string; value: string | boolean | number }[]
    required?: boolean
    rules?: FormRules[string]
    maxSize?: number
    allowedFormats?: string[]
    value?: (data: any) => string // Add this line
}[]
showFields?: {
    prop: string;
    label: string;
    type?: 'text' | 'image' | 'file'; // Sesuaikan tipe yang diizinkan untuk showFields
    value?: (data: any) => string; // Fungsi untuk mengkustomisasi nilai
}[];
createService?: (data: any) => Promise<any>
updateService?: (id: number, data: any) => Promise<any>
deleteService?: (id: number) => Promise<any>
deleteMultipleService?: (ids: number[]) => Promise<any>
showService?: (id: number) => Promise<any>
}>()

const emit = defineEmits(['update:visible', 'save', 'delete', 'close', 'multi-delete'])

const formData = ref<Partial<any>>({})
const formRef = ref<FormInstance>()
const loading = ref<boolean>(false)
const visible = ref(props.visible)
const fileLists = ref<Record<string, UploadFile[]>>({})
const showData = ref<any>(null)

// Fungsi untuk meratakan objek bertingkat dan hanya mengambil kunci terakhir
const flattenObject = (obj: any, prefix = ''): { label: string; value: any }[] => {
    const result: { label: string; value: any }[] = []
    for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}_${key}` : key
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            result.push(...flattenObject(value, fullKey))
        } else {
            // Ambil hanya bagian terakhir dari kunci
            const lastKey = fullKey.split('_').pop() || key
            // Lewati jika kunci mengandung "id" (case-insensitive)
            if (lastKey.toLowerCase().includes('id')) continue
            result.push({
                label: lastKey.split('.').join(' ').toLowerCase().replace(/\b\w/g, char => char.toUpperCase()),
                value: value
            })
        }
    }
    return result
}

// Fungsi untuk mendapatkan nilai field
const getFieldValue = (field: any) => {
    if (field.value) {
        const value = field.value(props.data);
        return value === '-' ? 'Belum diupload' : value;
    }
    return props.data ? props.data[field.prop] === '-' ? 'Belum diupload' : props.data[field.prop] : null;
};

// Fungsi untuk mendapatkan URL gambar
const getImageUrl = (field: any) => {
    const value = getFieldValue(field);
    if (!value) return '';
    // Jika isUrl true, gunakan nilai langsung; jika tidak, gabungkan dengan baseUrl
    return field.isUrl ? value : `${url}${value}`;
};

// Fungsi untuk mendapatkan URL file
const getFileUrl = (field: any) => {
    const value = getFieldValue(field);
    if (!value) return '';
    // Jika isUrl true, gunakan nilai langsung; jika tidak, gabungkan dengan url
    return field.isUrl ? value : `${url}${value}`;
};

// Computed untuk data tabel dari showData
const showDataEntries = computed(() => {
    if (!showData.value || typeof showData.value !== 'object') return []
    return flattenObject(showData.value)
})

const showFieldsToDisplay = computed(() => {
  // Jika showFields didefinisikan, gunakan itu; jika tidak, gunakan formFields
    return (props.showFields?.length ?? 0) > 0 ? props.showFields : props.formFields;
});

const fetchShowData = async () => {
    if (props.data?.id && props.showService) {
        try {
            loading.value = true
            const response = await props.showService(props.data.id)
            showData.value = response.data // Simpan data dari showService
        } catch (err) {
            console.error('Error fetching show data:', err)
            ElNotification({
                title: 'Error',
                message: 'Gagal mengambil data',
                type: 'error',
            })
        } finally {
            loading.value = false
        }
    }
}

const getFileList = (prop: string) => {
    return fileLists.value[prop] || []
}

// Tambahkan fungsi bantu untuk menentukan tipe file
const isImageFile = (filename: string) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);
};

const isPDFFile = (filename: string) => {
    return /\.pdf$/i.test(filename);
};

// Fungsi untuk mengkonversi allowedFormats ke format accept yang diterima el-upload
const getAcceptValue = (formats: string[]) => {
    return formats.map(format => `.${format}`).join(',');
};

const beforeFileUpload = (file: File, field: (typeof props.formFields)[number]) => {
    const allowedFormats = field.allowedFormats || ['jpg', 'png', 'jpeg']; // Default ke gambar jika tidak ditentukan
    const isAllowedFormat = allowedFormats.some(format => 
        file.name.toLowerCase().endsWith(`.${format.toLowerCase()}`)
    );
    const isLtMaxSize = file.size / 1024 / 1024 < (field.maxSize || 5);

    if (!isAllowedFormat) {
        ElNotification({
            title: 'Error',
            message: `File harus dalam format ${allowedFormats.join(', ')}!`,
            type: 'error',
        });
        return false;
    }
    if (!isLtMaxSize) {
        ElNotification({
            title: 'Error',
            message: `Ukuran file harus kurang dari ${field.maxSize || 5}MB!`,
            type: 'error',
        });
        return false;
    }
    return true;
};

const handleFileChange = (uploadFile: UploadFile, uploadFiles: UploadFile[], field: (typeof props.formFields)[number]) => {
    if (uploadFile.status === 'ready') {
        const file = uploadFile.raw as File;
        if (!beforeFileUpload(file, field)) {
            fileLists.value[field.prop] = [];
            formData.value[field.prop] = undefined;
            return;
        }
        fileLists.value[field.prop] = [];
        formData.value[field.prop] = file;
        fileLists.value[field.prop] = [{
            name: file.name,
            url: URL.createObjectURL(file),
            status: 'ready',
            uid: Date.now() + Math.random() * 10000000,
        }];
    }
};

const validateFileField = (field: (typeof props.formFields)[number], value: any, callback: (error?: string) => void) => {
    if (field.required && !value) {
        callback(`${field.label} harus diisi`)
    } else if (value && !(value instanceof File) && typeof value !== 'string') {
        callback('File atau URL tidak valid')
    } else {
        callback()
    }
}

const formRules = computed(() => {
    const rules: FormRules = {}
    props.formFields.forEach(field => {
        rules[field.prop] = [
        ...(field.required ? [{ required: true, message: `${field.label} harus diisi`, trigger: 'blur' }] : []),
        ...(Array.isArray(field.rules) ? field.rules : []),
        ...(field.type === 'file' ? [
            { validator: (rule: any, value: any, callback: any) => validateFileField(field, value, callback), trigger: 'change' },
        ] : []),
        ]
    })
    return rules
})

const modalTitle = computed(() => {
switch (props.mode) {
    case 'create': return `Tambah ${props.name}`
    case 'update': return `Edit ${props.name}`
    case 'show': return `Detail ${props.name}`
    case 'delete': return `Hapus ${props.name}`
    case 'multi-delete': return `Hapus ${props.name}`
    default: return 'Modal'
}
})

const actionButtonText = computed(() => {
switch (props.mode) {
    case 'create': return 'Simpan'
    case 'update': return 'Perbarui'
    case 'multi-delete': return 'Hapus'
    case 'delete': return 'Hapus'
    case 'show': return 'Tutup'
    default: return 'OK'
}
})

watch(() => props.visible, async (newVal) => {
    visible.value = newVal
    if (newVal) {
        if (props.mode === 'show' && props.data?.id && props.showService) {
            await fetchShowData()
        } else {
            formData.value = props.data ? { ...props.data } : {}
            fileLists.value = {}
        }
    }
})

watch(visible, (newVal) => {
    emit('update:visible', newVal)
})

// Referensi untuk tombol submit
const submitButtonSave = ref<InstanceType<typeof ElButton> | null>(null);
const submitButtonDelete = ref<InstanceType<typeof ElButton> | null>(null);

const handleClose = () => {
    visible.value = false
    fileLists.value = {}
    emit('close')
}

const handleEnterKey = (event:any) => {
    if (event.key === 'Enter') {
        event.preventDefault(); // Mencegah behavior default
        if (props.mode === 'delete' || props.mode === 'multi-delete') {
            submitButtonDelete.value?.$el.click(); // Trigger klik pada tombol Hapus
        } else if (props.mode === 'create' || props.mode === 'update') {
            submitButtonSave.value?.$el.click(); // Trigger klik pada tombol Simpan
        }
    }
};

// Lifecycle Hooks
onMounted(() => {
    nextTick(() => {
        if (props.mode === 'delete' || props.mode === 'multi-delete') {
            submitButtonDelete.value?.$el.focus();
        } else if (props.mode === 'create' || props.mode === 'update') {
            submitButtonSave.value?.$el.focus();
        }
    });
});

const handleDateChange = (prop: string) => {
    const field = props.formFields.find(f => f.prop === prop);
    if (field?.type === 'date' && formData.value[prop] instanceof Date) {
        formData.value[prop] = format(formData.value[prop], 'yyyy-MM-dd');
    }
};

const handleYearChange = (prop: string) => {
    const field = props.formFields.find(f => f.prop === prop);
    if (field?.type === 'year' && formData.value[prop] instanceof Date) {
        formData.value[prop] = format(formData.value[prop], 'yyyy');
    }
};

const handleAction = async () => {
    if (['create', 'update'].includes(props.mode) && formRef.value) {
        await formRef.value.validate(async (valid: boolean) => {
            if (valid) {
            try {
                loading.value = true
                const apiData = mapFormToApi(formData.value)
                console.log(props.data);
                
                let response: AxiosResponse<any>
                if (props.mode === 'create' && props.createService) {
                    response = await props.createService(apiData)
                    visible.value = false
                    emit('save', response.data)
                } else if (props.mode === 'update' && props.updateService && props.data?.id) {
                    response = await props.updateService(props.data.id, apiData)
                    visible.value = false
                    emit('save', response.data)
                }
            } catch (err) {
                console.error('Error during save:', err)
            } finally {
                loading.value = false
            }
            }
        })
    } else if (props.mode === 'show' && props.data?.id && props.showService) {
        try {
            loading.value = true
            const response = await props.showService(props.data.id)
            console.log(response);
            
            formData.value = { ...response.data } // Gunakan data respons langsung
        } catch (err) {
            console.error('Error during show:', err)
        } finally {
            loading.value = false
            visible.value = false
        }
    }    
}

const handleDeleteAction = async () => {
    if (props.mode === 'delete' && props.data?.id && props.deleteService) {
        try {
            loading.value = true
            await props.deleteService(props.data.id)
            emit('delete', props.data.id)
            visible.value = false
        } catch (err) {
            console.error('Error during delete:', err)
        } finally {
            loading.value = false
        }
    } else if (props.mode === 'multi-delete' && props.selectedIds && props.deleteMultipleService) {
        try {
            loading.value = true
            await props.deleteMultipleService(props.selectedIds)
            emit('multi-delete', props.selectedIds)
            visible.value = false
        } catch (err) {
            console.error('Error during multi-delete:', err)
        } finally {
            loading.value = false
        }
    }
}

const mapFormToApi = (form: Partial<any>): any => {
    return {
        ...form,
        ...(form._method ? { _method: form._method } : {}),
    }
}
</script>

<style scoped>
.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}
</style>