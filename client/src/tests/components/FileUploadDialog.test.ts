import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FileUploadDialog from '@/components/FileUploadDialog.vue'

describe('FileUploadDialog', () => {
  const defaultStubs = {
    AlertDialog: { template: '<div><slot /></div>' },
    AlertDialogContent: { template: '<div><slot /></div>' },
    AlertDialogHeader: { template: '<div><slot /></div>' },
    AlertDialogTitle: { template: '<div><slot /></div>' },
    AlertDialogDescription: { template: '<div><slot /></div>' },
    AlertDialogFooter: { template: '<div><slot /></div>' },
    AlertDialogCancel: { template: '<button><slot /></button>' },
    AlertDialogAction: { template: '<button><slot /></button>' },
    Button: { template: '<button><slot /></button>' },
    Upload: { template: '<div></div>' },
    CheckCircle: { template: '<div></div>' },
    X: { template: '<div></div>' },
    Paperclip: { template: '<div></div>' },
  }

  it('displays step number in description', () => {
    const stepNumber = 5
    const wrapper = mount(FileUploadDialog, {
      props: {
        open: true,
        stepNumber,
      },
      global: {
        stubs: defaultStubs,
      },
    })

    expect(wrapper.text()).toContain(`Choose a file to upload for step ${stepNumber}`)
  })

  it('shows upload prompt when no files selected', () => {
    const wrapper = mount(FileUploadDialog, {
      props: {
        open: true,
        stepNumber: 1,
      },
      global: {
        stubs: defaultStubs,
      },
    })

    expect(wrapper.text()).toContain('Click to upload or drag and drop')
    expect(wrapper.text()).toContain('Any file type except .exe, up to 10MB each')
  })

  it('does not allow .exe files to be selected', async () => {
    const wrapper = mount(FileUploadDialog, {
      props: {
        open: true,
        stepNumber: 1,
      },
      global: {
        stubs: defaultStubs,
      },
    })

    const fileInput = wrapper.find('input[type="file"]')
    const validFile = new File(['content'], 'test.txt', { type: 'text/plain' })
    const exeFile = new File([''], 'malware.exe', { type: 'application/x-msdownload' })

    Object.defineProperty(fileInput.element, 'files', {
      value: [validFile, exeFile],
      writable: false,
    })

    await fileInput.trigger('change')

    // Only valid file should be shown
    expect(wrapper.text()).toContain('test.txt')
    expect(wrapper.text()).not.toContain('malware.exe')
    expect(wrapper.text()).toContain('1 file selected')
  })

  it('shows singular file count when one file is selected', async () => {
    const wrapper = mount(FileUploadDialog, {
      props: {
        open: true,
        stepNumber: 1,
      },
      global: {
        stubs: defaultStubs,
      },
    })

    const fileInput = wrapper.find('input[type="file"]')
    const file = new File(['content'], 'test.txt', { type: 'text/plain' })

    Object.defineProperty(fileInput.element, 'files', {
      value: [file],
      writable: false,
    })

    await fileInput.trigger('change')

    expect(wrapper.text()).toContain('1 file selected')
  })

  it('shows plural file count when multiple files are selected', async () => {
    const wrapper = mount(FileUploadDialog, {
      props: {
        open: true,
        stepNumber: 1,
      },
      global: {
        stubs: defaultStubs,
      },
    })

    const fileInput = wrapper.find('input[type="file"]')
    const files = [
      new File(['content1'], 'test1.txt', { type: 'text/plain' }),
      new File(['content2'], 'test2.txt', { type: 'text/plain' }),
    ]

    Object.defineProperty(fileInput.element, 'files', {
      value: files,
      writable: false,
    })

    await fileInput.trigger('change')

    expect(wrapper.text()).toContain('2 files selected')
  })

  it('shows file details when files are selected', async () => {
    const wrapper = mount(FileUploadDialog, {
      props: {
        open: true,
        stepNumber: 1,
      },
      global: {
        stubs: defaultStubs,
      },
    })

    const fileInput = wrapper.find('input[type="file"]')
    // Create a mock file with specific size
    const mockFile = new File([''], 'document.pdf', { type: 'application/pdf' })

    // Mock the file size property
    Object.defineProperty(mockFile, 'size', {
      value: 2048, // 2 KB
      writable: false,
    })

    Object.defineProperty(fileInput.element, 'files', {
      value: [mockFile],
      writable: false,
    })

    await fileInput.trigger('change')

    // Check that file name is displayed
    expect(wrapper.text()).toContain('document.pdf')
    // Check that file size is displayed (2048 bytes = 2 KB)
    expect(wrapper.text()).toContain('2 KB')
  })
})
