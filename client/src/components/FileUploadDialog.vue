<template>
  <AlertDialog :open="open" @open="$emit('open', $event)">
    <AlertDialogContent class="sm:max-w-md">
      <AlertDialogHeader>
        <AlertDialogTitle>Upload File</AlertDialogTitle>
        <AlertDialogDescription>
          Choose a file to upload for step {{ stepNumber }}.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <div class="flex flex-col gap-4 py-2">
        <div
          class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 cursor-pointer"
          :class="{ 'border-blue-500 bg-blue-50': isDragOver }" @click="openFileDialog" @drop.prevent="handleDrop"
          @dragover.prevent="isDragOver = true" @dragleave.prevent="isDragOver = false">
          <input ref="fileInput" type="file" class="hidden" multiple @change="handleFileSelect" />
          <div v-if="!selectedFiles.length" class="flex flex-col items-center gap-2">
            <Upload class="text-gray-400 w-8 h-8" />
            <p class="text-sm">
              Click to upload or drag and drop
            </p>
            <p class="text-xs text-muted-foreground">
              Any file type except .exe, up to 10MB each
            </p>
          </div>
          <div v-else class="flex flex-col items-center gap-2">
            <CheckCircle class="text-green-500 w-8 h-8" />
            <p class="text-sm font-medium">
              {{ selectedFiles.length }} file{{ selectedFiles.length > 1 ? 's' : '' }} selected
            </p>
          </div>
        </div>
        <div v-if="selectedFiles.length" class="flex flex-col gap-2 max-h-32 overflow-y-auto">
          <div v-for="(file, index) in selectedFiles" :key="index"
            class="flex items-center justify-between p-2 bg-muted rounded border">
            <div class="flex flex-row items-center gap-2">
              <Paperclip class="h-4 w-4 text-muted-foreground" />
              <span class="text-sm truncate max-w-[240px]">{{ file.name }}</span>
              <span class="text-xs text-muted-foreground">
                ({{ formatFileSize(file.size) }})
              </span>
            </div>
            <Button variant="ghost" size="sm" @click="removeFile(index)" class="text-muted-foreground">
              <X class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      <AlertDialogFooter>
        <AlertDialogCancel @click="handleCancel">Cancel</AlertDialogCancel>
        <AlertDialogAction @click="handleUpload" :disabled="!selectedFiles.length">
          <Upload class="h-4 w-4" />
          Upload
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AlertDialog from '@/components/ui/alert-dialog/AlertDialog.vue'
import AlertDialogAction from '@/components/ui/alert-dialog/AlertDialogAction.vue'
import AlertDialogCancel from '@/components/ui/alert-dialog/AlertDialogCancel.vue'
import AlertDialogContent from '@/components/ui/alert-dialog/AlertDialogContent.vue'
import AlertDialogDescription from '@/components/ui/alert-dialog/AlertDialogDescription.vue'
import AlertDialogFooter from '@/components/ui/alert-dialog/AlertDialogFooter.vue'
import AlertDialogHeader from '@/components/ui/alert-dialog/AlertDialogHeader.vue'
import AlertDialogTitle from '@/components/ui/alert-dialog/AlertDialogTitle.vue'
import Button from '@/components/ui/button/Button.vue'
import { Upload, CheckCircle, X, Paperclip } from 'lucide-vue-next'


defineProps({
  open: {
    type: Boolean,
    required: true,
  },
  stepNumber: {
    type: Number,
    required: true,
  }
})

const emit = defineEmits<{
  'open': [value: boolean]
  'upload-files': [files: File[]]
}>()

const fileInput = ref<HTMLInputElement>()
const selectedFiles = ref<File[]>([])
const isDragOver = ref(false)

const openFileDialog = () => {
  fileInput.value?.click()
}

const isAllowedFileType = (file: File) => {
  return !file.name.toLocaleLowerCase().endsWith('.exe')
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    const validFiles = Array.from(target.files).filter(isAllowedFileType)
    selectedFiles.value.push(...validFiles)
  }
}

const handleDrop = (event: DragEvent) => {
  isDragOver.value = false
  if (event.dataTransfer?.files) {
    const validFiles = Array.from(event.dataTransfer.files).filter(isAllowedFileType)
    selectedFiles.value.push(...validFiles)
  }
}

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1)
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const handleUpload = () => {
  if (selectedFiles.value.length > 0) {
    emit('upload-files', [...selectedFiles.value])
    selectedFiles.value = []
    emit('open', false)
  }
}

const handleCancel = () => {
  selectedFiles.value = []
  emit('open', false)
}
</script>
