
// generate this file by scripts/genarate-example-entry.mjs
import React from "react";

export default {
  "alert-modal-action": {
    component: React.lazy(() => import("./alert-modal-action")),
    codeString: `import { Button, modalAction } from '@easy-shadcn/react'

const Demo = () => {
  return (
    <Button
      onClick={() => {
        modalAction.confirm({
          title: 'Tips',
          content: 'If onConfirm or onCancel is asynchronous events, the button will automatically display loading',
          onCancel: () => {
            console.log('cancel')
          },
          onConfirm: () => new Promise((resolve) => {
            setTimeout(() => {
              console.log('confirm')
              resolve()
            }, 1000)
          })
        })
      }}
    >
      Click Confirm
    </Button>
  )
}

export default Demo
`
  },

  "badge-demo": {
    component: React.lazy(() => import("./badge-demo")),
    codeString: `import { Badge } from '@easy-shadcn/react';

const Demo = () => {
  return (
    <div>
      <div className="mb-2 flex gap-2">
        <Badge>default</Badge>
        <Badge variant="secondary">secondary</Badge>
        <Badge variant="destructive">destructive</Badge>
        <Badge variant="outline">outline</Badge>
      </div>
    </div>
  );
};

export default Demo;
`
  },

  "button-async-action": {
    component: React.lazy(() => import("./button-async-action")),
    codeString: `import { Button } from "@easy-shadcn/react"

const Demo = () => {
  const handleAsyncAction = async () => {
    await new Promise(resolve => {
      setTimeout(() => {
        resolve(null)
      }, 1000)
    })
  }
  return (
    <Button onClick={handleAsyncAction}>Async Event Auto Loading</Button>
  )
}

export default Demo
`
  },

  "button-demo": {
    component: React.lazy(() => import("./button-demo")),
    codeString: `import { Button } from "@easy-shadcn/react"

const Demo = () => {
  return (
    <div>
      <div className="flex gap-2 mb-2">
        <Button>default</Button>
        <Button variant="destructive">destructive</Button>
        <Button variant="secondary">secondary</Button>
        <Button variant="outline">outline</Button>
        <Button variant="ghost">ghost</Button>
        <Button variant="link">link</Button>
      </div>
      <div className="flex gap-2">
        <Button size="sm">size sm</Button>
        <Button>size default</Button>
        <Button size="lg">size lg</Button>
        <Button size="icon">icon</Button>
      </div>
    </div>
  )
}

export default Demo
`
  },

  "calendar-demo": {
    component: React.lazy(() => import("./calendar-demo")),
    codeString: `import { useState } from "react";
import { Calendar } from "@easy-shadcn/react";

const Demo = () => {
  const [selected, setSelected] = useState<Date>();
  return (
    <Calendar
      selected={selected}
      onSelect={setSelected}
      mode="single"
    />
  )
}

export default Demo
`
  },

  "card-demo": {
    component: React.lazy(() => import("./card-demo")),
    codeString: `import { Card, Button } from "@easy-shadcn/react";

const Demo = () => {
  return (
    <Card
      title='Default Card'
      style={{ width: '300px' }}
      description='some descriptions'
      content={(
        <div>
          <div>content1-content1-content1</div>
          <div>content2</div>
          <div>content3</div>
        </div>
      )}
      footer={(
        <Button>Button</Button>
      )}
      footerProps={{
        style: {
          display: 'flex',
          justifyContent: 'end'
        }
      }}
    />
  )
}

export default Demo
`
  },

  "config-provider-demo": {
    component: React.lazy(() => import("./config-provider-demo")),
    codeString: `import { zhCN } from 'date-fns/locale'
import { ConfigProvider, Calendar } from "@easy-shadcn/react";

const Demo = () => {
  return (
    <ConfigProvider
      dateLocal={zhCN}
    >
      <div>
        <Calendar />
      </div>
    </ConfigProvider>
  )
}

export default Demo
`
  },

  "datepicker-demo": {
    component: React.lazy(() => import("./datepicker-demo")),
    codeString: `import { DatePicker } from "@easy-shadcn/react";

const Demo = () => {
  return (
    <div className="flex gap-6 flex-wrap">
      <DatePicker />
      <DatePicker mode="multiple" placeholder="Pick multiple date" />
      <DatePicker buttonClassName="w-64" mode="range" placeholder="Pick range date" />
    </div>
  )
}

export default Demo
`
  },

  "datepicker-format": {
    component: React.lazy(() => import("./datepicker-format")),
    codeString: `import { DatePicker } from "@easy-shadcn/react";

const Demo = () => {
  return (
    <div className="flex gap-6 flex-wrap">
      <DatePicker dateFormat="PPPP" />
    </div>
  )
}

export default Demo
`
  },

  "dropdown-menu-demo": {
    component: React.lazy(() => import("./dropdown-menu-demo")),
    codeString: `import { DropdownMenu, Button } from "@easy-shadcn/react";

const Demo = () => {
  return (
    <DropdownMenu
      menu={[
        {
          name: 'Profile',
          key: 'profile',
          shortcut: '⇧⌘P',
        },
        {
          name: 'Billing',
          key: 'billing',
          shortcut: '⌘B',
        },
        {
          groupName: 'More',
          key: 'more',
          items: [
            {
              prefix: 'PREFIX',
              name: 'Github',
              key: 'github',
            },
            {
              name: 'Support',
              key: 'support',
            },
            {
              name: 'API',
              key: 'api',
              disabled: true
            },
          ],
        },
        {
          name: 'Log Out',
          key: 'logout',
          shortcut: '⇧⌘Q',
        },
      ]}
    >
      <Button>Here</Button>
    </DropdownMenu>
  )
}

export default Demo
`
  },

  "dropdown-menu-sub": {
    component: React.lazy(() => import("./dropdown-menu-sub")),
    codeString: `import { DropdownMenu, Button } from "@easy-shadcn/react";

const Demo = () => {
  return (
    <DropdownMenu
      menu={[
        {
          name: 'item1',
          key: 'item1',
        },
        {
          name: 'item2',
          key: 'item2',
          subItems: [
            {
              name: 'sub1-item1',
              key: 'sub1-item1',
            },
            {
              name: 'sub1-item2',
              key: 'sub1-item2',
              subItems: [
                {
                  name: 'sub2-item1',
                  key: 'sub2-item1',
                },
                {
                  name: 'sub2-item2',
                  key: 'sub2-item2',
                },
                {
                  groupName: 'sub2-group',
                  key: 'sub2-group',
                  items: [
                    {
                      name: 'sub2-group-item1',
                      key: 'sub2-group-item1',
                    },
                    {
                      name: 'sub2-group-item2',
                      key: 'sub2-group-item2',
                    },
                  ]
                },
              ]
            },
          ]
        },
        {
          name: 'item3',
          key: 'item3',
        },
      ]}
    >
      <Button>Deep Nested Sub Menu</Button>
    </DropdownMenu>
  )
}

export default Demo
`
  },

  "modal-action": {
    component: React.lazy(() => import("./modal-action")),
    codeString: `import { Button, modalAction } from '@easy-shadcn/react'

const Demo = () => {
  return (
    <Button
      onClick={() => {
        modalAction.open({
          title: 'title',
          content: 'Modal Content',
          footer: 'Modal Footer'
        })
      }}
    >
      Click Open Modal
    </Button>
  )
}

export default Demo
`
  },

  "modal-demo": {
    component: React.lazy(() => import("./modal-demo")),
    codeString: `import { Button, Modal } from '@easy-shadcn/react'
import { useState } from 'react'

const Demo = () => {
  const [showModal, setShowModal] = useState(false)

  return (
    <div>
      <Modal
        open={showModal}
        onOpenChange={setShowModal}
        title="Modal Title"
        content={(
          <div>
            <div>Modal Content</div>
            <div>Modal Content</div>
            <div>Modal Content</div>
            <div>Modal Content</div>
          </div>
        )}
        footer={(
          <div className='space-x-2'>
            <Button
              variant="ghost"
              onClick={() => {
                setShowModal(false)
              }}
            >
              Cancel
            </Button>
            <Button>
              Save
            </Button>
          </div>
        )}
      >
        <Button>Click Show Modal</Button>
      </Modal>
    </div>
  )
}

export default Demo
`
  },

  "modal-form-action": {
    component: React.lazy(() => import("./modal-form-action")),
    codeString: `import { Button, Form, FormItem, Input, modalAction } from '@easy-shadcn/react'

const Demo = () => {
  const form = Form.useForm({
    defaultValues: {
      username: "",
      remark: "",
    },
  })

  return (
    <Button
      onClick={() => {
        const modal = modalAction.open({
          title: 'Form Title',
          content: (
            <Form form={form} className='space-y-4'>
              <FormItem
                control={form.control}
                name="username"
                label="User Name"
                render={({ field }) => (
                  <Input placeholder="shadcn" {...field} />
                )}
              />
              <FormItem
                control={form.control}
                name="remark"
                label="Remark"
                render={({ field }) => (
                  <Input placeholder="shadcn" {...field} />
                )}
              />
            </Form>
          ),
          footer: (
            <div>
              <Button
                onClick={
                  form.handleSubmit((data) => {
                    modalAction.confirm({
                      title: 'Are you sure to submit',
                      content: 'Close the form pop-up after submission',
                      onConfirm: () => {
                        console.log('data', data)
                        modal.close()
                      }
                    })
                  })
                }
              >Confirm</Button>
            </div>
          )
        })
      }}
    >
      Click Open Modal Form
    </Button>
  )
}

export default Demo
`
  },

  "modal-hooks-demo": {
    component: React.lazy(() => import("./modal-hooks-demo")),
    codeString: `import { Button, useModal } from '@easy-shadcn/react'

const AnyModalContent = () => (
  <div>
    AnyModalContent
  </div>
)

const Demo = () => {
  const [modalHost, modalAction] = useModal()

  const handleClick = () => {
    modalAction.open({
      title: 'Modal Open By hooks action',
      content: <AnyModalContent />,
      footer: (
        <div className='space-x-2'>
          <Button
            variant="ghost"
            onClick={() => {
              modalAction.close()
            }}
          >
            Cancel
          </Button>
          <Button>
            Save
          </Button>
        </div>
      ),
    })
  }

  return (
    <div>
      <Button onClick={handleClick}>Click Show Modal</Button>
      {modalHost}
    </div>
  )
}

export default Demo
`
  },

  "modal-host": {
    component: React.lazy(() => import("./modal-host")),
    codeString: `import { ModalHost } from '@easy-shadcn/react'

const App = () => {
  return (
    <div>
      <ModalHost />
    </div>
  )
}

export default App
`
  },

  "popover-demo": {
    component: React.lazy(() => import("./popover-demo")),
    codeString: `import { Popover, Button } from "@easy-shadcn/react";

const Demo = () => {
  return (
    <Popover
      content={"Popover Content"}
    >
      <Button>Show</Button>
    </Popover>
  )
}

export default Demo
`
  },

  "select-demo": {
    component: React.lazy(() => import("./select-demo")),
    codeString: `import { Select } from '@easy-shadcn/react';

const Demo = () => {
  return (
    <div>
      <div className="mb-2 flex gap-2">
        <Select
          width={200}
          options={[
            {
              value: 1,
              label: 'Option 1',
            },
            {
              value: 2,
              label: 'Option 2',
            },
            {
              value: 3,
              label: 'Option 3',
            },
          ]}
          placeholder="please select"
        />
        <Select
          width={200}
          allowClear
          options={[
            {
              value: 1,
              label: 'Option 1',
            },
            {
              value: 2,
              label: 'Option 2',
            },
            {
              value: 3,
              label: 'Option 3',
            },
          ]}
          placeholder="allow clear"
        />
      </div>
    </div>
  );
};

export default Demo;
`
  },

  "select-multiple-demo": {
    component: React.lazy(() => import("./select-multiple-demo")),
    codeString: `import { Select } from '@easy-shadcn/react';

const Demo = () => {
  const options = [
    {
      value: 1,
      label: 'Option 1',
    },
    {
      value: 2,
      label: 'Option 2',
    },
    {
      value: 3,
      label: 'Option 3',
    },
    {
      value: 4,
      label: 'Option 4',
    },
    {
      value: 5,
      label: 'Option 5',
    },
  ];
  return (
    <div>
      <div className="mb-2 flex gap-2">
        <Select width={200} multiple options={options} placeholder="please multiple" />
        <Select width={200} multiple allowClear options={options} placeholder="allow clear" />
      </div>
    </div>
  );
};

export default Demo;
`
  },

  "switch-demo": {
    component: React.lazy(() => import("./switch-demo")),
    codeString: `import { Switch } from '@easy-shadcn/react';

const Demo = () => {
  return (
    <div>
      <div className="mb-2 flex gap-2">
        <Switch label="Normal" />
        <Switch label="Controlled" checked />
      </div>
    </div>
  );
};

export default Demo;
`
  },

  "tabs-controlled": {
    component: React.lazy(() => import("./tabs-controlled")),
    codeString: `import { useState } from "react";
import { Tabs, Button } from "@easy-shadcn/react";

const Demo = () => {
  const [currentTab, setCurrentTab] = useState('first')

  return (
    <Tabs
      value={currentTab}
      onValueChange={setCurrentTab}
      option={[
        {
          title: 'First',
          value: 'first',
          content: (
            <div>
              <p>First Content</p>
              <Button onClick={() => setCurrentTab('second')}>Change to Second</Button>
            </div>
          )
        },
        {
          title: 'Second',
          value: 'second',
          content: (
            <div>
              <p>Second Content</p>
              <Button onClick={() => setCurrentTab('first')}>Change to First</Button>
            </div>
          )
        },
      ]}
    />
  )
}

export default Demo
`
  },

  "tabs-customize-style": {
    component: React.lazy(() => import("./tabs-customize-style")),
    codeString: `import { Tabs } from "@easy-shadcn/react";

const Demo = () => {
  return (
    <Tabs
      style={{
        width: '100%',
      }}
      defaultValue="first"
      contentProps={{
        style: {
          padding: '10px',
          border: '1px solid #dfdfdf',
        }
      }}
      option={[
        {
          title: 'First',
          value: 'first',
          content: (
            <div>First Content</div>
          )
        },
        {
          title: 'Second',
          value: 'second',
          triggerProps: {
            style: {
              fontSize: '20px'
            }
          },
          content: (
            <div>Second Content</div>
          )
        },
      ]}
    />
  )
}

export default Demo
`
  },

  "tabs-demo": {
    component: React.lazy(() => import("./tabs-demo")),
    codeString: `import { Tabs } from "@easy-shadcn/react";

const Demo = () => {
  return (
    <Tabs
      defaultValue="first"
      option={[
        {
          title: 'First',
          value: 'first',
          content: (
            <div>First Content</div>
          )
        },
        {
          title: 'Second',
          value: 'second',
          content: (
            <div>Second Content</div>
          )
        },
      ]}
    />
  )
}

export default Demo
`
  },

  "toast-demo": {
    component: React.lazy(() => import("./toast-demo")),
    codeString: `import { Toaster, toast, Button } from "@easy-shadcn/react"

const Demo = () => {
  return (
    <div className="flex gap-2">
      <Button
        onClick={() => {
          toast.success('Hi Here, success', {
            duration: Infinity,
            closeButton: true,
          })
        }}
      >
        success
      </Button>
      <Button
        onClick={() => {
          toast.error('Hi Here, error')
        }}
      >
        error
      </Button>
      <Button
        onClick={() => {
          toast.info('Hi Here, info')
        }}
      >
        info
      </Button>
      <Toaster richColors />
    </div>
  )
}

export default Demo
`
  },

  "toggle-controlled": {
    component: React.lazy(() => import("./toggle-controlled")),
    codeString: `import { Toggle } from "@easy-shadcn/react";
import { useState } from "react";

const Demo = () => {
  const [value, setValue] = useState('first')
  return (
    <Toggle
      type='single'
      value={value}
      onValueChange={(val) => {
        if (val) {
          setValue(val)
        }
      }}
      options={[
        {
          value: 'first',
          label: "First"
        },
        {
          value: 'second',
          label: "Second"
        },
      ]}
    />
  )
}

export default Demo
`
  },

  "toggle-demo": {
    component: React.lazy(() => import("./toggle-demo")),
    codeString: `import { Toggle } from "@easy-shadcn/react";

const Demo = () => {
  return (
    <Toggle
      type='single'
      options={[
        {
          value: 'first',
          label: "First"
        },
        {
          value: 'second',
          label: "Second"
        },
      ]}
    />
  )
}

export default Demo
`
  },

  "tooltip-demo": {
    component: React.lazy(() => import("./tooltip-demo")),
    codeString: `import { Button, Tooltip } from "@easy-shadcn/react";

const Demo = () => {
  return (
    <Tooltip
      content="This is a tooltip"
    >
      <Button>Hover Here</Button>
    </Tooltip>
  )
}

export default Demo
`
  },
} as const
