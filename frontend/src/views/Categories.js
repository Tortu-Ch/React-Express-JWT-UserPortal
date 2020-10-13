import React, { useEffect, useState } from 'react';
import {useHistory} from 'react-router-dom'
import { useFormik } from 'formik';
import axios from '../services/api'
import {
  CBadge,
  CCard,
  CCardBody,
  CCardHeader,
  CDataTable,
  CButton,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CRow, CCol,
  CInputFile,
  CForm,
  CFormGroup,
  CInput,
  CFormText
} from '@coreui/react'
import CIcon from '@coreui/icons-react'


const Category = () =>{
  const history = useHistory()
  const [categoryData, setCategoryData] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [status, setStatus] = useState(0)
  const [rowID, setRowID] =useState(null)
  const [rowData, setRowData] = useState([])
  const fields = ['id','name', 'nickname', 'amount_patients', 'amount_suitable_overflow', 'duration_time', 'color', 'deleted', 'fk_license' ,'action']
  const user_info = JSON.parse(localStorage.getItem('user_info'))
  if (user_info) {
    const ownRoles = user_info.user.roles.map(item=> item.nome)
    if (!ownRoles.includes('ROLE_CAT_EDIT')) fields.splice(-1,1)
  }


  const hanldeShowModal = () => {
    setRowID(null)
    setShowModal(!showModal)
  }

  const addOrEdit = (id, item) => {
    setRowID(id)
    setRowData(item)
  }

  const deleteRow = (rowID) => {
    axios.delete('/categories/' + rowID, {
      headers: {
        authorization: user_info.accessToken
      }
    }).then(res => {
      alert(res.data.message)
      handleAddNew()
    }).catch(err => alert(err.message))
  }

  const dateConvertor = (dt) => {
    let date = new Date(dt);
    return (
      `${date.getFullYear()}-${((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1)))}-${((date.getDate() > 9) ? date.getDate() : ('0' + date.getDate()))} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}
    `);
  }


  useEffect( () => {
    async function getPermissions() {
      try {
        const res = await axios.get('/categories', {
          headers: {
            authorization: user_info.accessToken
          }
        })
        if (res.data.category) {
          const val = res.data.category
          setCategoryData(val)
        } else {
          history.push('/login')
          localStorage.removeItem('user_info')
        }
      } catch (err) {
        alert(err.message)
      }
    }
    getPermissions()
  }, [status])

  useEffect(() => {
    if (rowID !== null){
      setShowModal(!showModal)
    }
  }, [rowID])

  function handleAddNew() {
    setStatus(status + 1)
  }

  return (
    <>
      <CRow className="justify-content-center">
        <CCol md="12">
          <CCard>
            {fields.includes('action')&&(
              <CCardHeader >
                <CRow>
                  <CCol>
                    <CButton onClick={()=>addOrEdit(-1, [])} className="px-5" color="info">+ Add New</CButton>
                    <Modal rowID={rowID}  display={showModal} rowData={rowData} handleDisplay={hanldeShowModal}  handleAddNew={handleAddNew} />
                  </CCol>
                </CRow>
              </CCardHeader>
            )}
            <CCardBody>
              <CDataTable
                items={categoryData}
                fields={fields}
                itemsPerPageSelect
                itemsPerPage={5}
                pagination
                tableFilter
                scopedSlots = {{
                  'id' : (item, index) => (
                    <td>
                      {index + 1}
                    </td>
                  ),
                  'picture': (item) => (
                    <td>
                      <div className={'c-avatar'}>
                        <img className={'c-avatar-img'} src={item.picture} alt={''}/>
                      </div>
                    </td>
                  ),
                  'gender':
                    (item)=>(
                      <td>
                        <CBadge shape={'pill'} color={item.gender === 0? 'info' : 'success'}>
                          {item.gender === 0? "Male" : "Female"}
                        </CBadge>
                      </td>
                    ),
                  'duration_time':(item)=> (
                    <td>
                      {dateConvertor(item.duration_time)}
                    </td>
                  ),
                  'deleted':(item) => (
                    <td><CBadge color={item.deleted === 1? 'danger' : 'warning'}>{item.deleted === 1? 'Deleted': 'Working'}</CBadge></td>
                  ),
                  'action': (item) => (
                    <td width={102}>
                      <CRow>
                        <CCol>
                          <CButton onClick={(e)=> addOrEdit(item.id, item)} className={'btn-pill'} size={'sm'} ><CIcon className={'cust_action_edit'} name={'cilPencil'} /></CButton>
                        </CCol>
                        <CCol>
                          <CButton onClick={(e) => deleteRow(item.id)}  className={'btn-pill'} size={'sm'} ><CIcon className={'cust_action_delete'} name={'cilTrash'}/></CButton>
                        </CCol>
                      </CRow>
                    </td>
                  )
                }}
              />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

    </>
  );
}

const Modal = (props) => {
  const [mess, setMess] = useState('')
  const rowData = props.rowData
  function handleAddNewOne() {
    props.handleAddNew();
  }
  const handleDisplay = () => {
    setMess('')
    props.handleDisplay()
  }

  const validate = values => {
    const errors = {};
    if (!values.name ) {
      errors.password = 'Required';
    }
    return errors;
  }
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: rowData.name || '',
      deleted: rowData.deleted || '',
      fk_license: rowData.fk_license || '',
      nickname: rowData.nickname || '',
      amount_patients: rowData.amount_patients || '',
      amount_suitable_overflow: rowData.amount_suitable_overflow || '',
      duration_time: rowData.duration_time || '',
      color: rowData.color||'',
    },
    validate,
    onSubmit: values => {
      console.log("adfadf")
      add_new(values)
    }
  })

  async function add_new(values) {
    const user_info = JSON.parse(localStorage.getItem('user_info'))
    if (user_info.user){
      let response = null
      console.log(props.rowID)
      try {
        if (props.rowID === -1){
          response = await axios.post(`/categories`, values, {
            headers: {
              authorization: user_info.accessToken
            }
          })
        }
        if (props.rowID >= 0) {
          response = await axios.put(`/categories/${props.rowID}`, values, {
            headers: {
              authorization: user_info.accessToken
            }
          })
        }
        if (response.data.message === "Success"){
          handleAddNewOne();
          handleDisplay()
        } else {
          setMess(response.data.message)
        }
      } catch (e) {
        alert(e.message)
      }
    }

  }

  return (
    <>
      <CModal
        show={props.display}
        onClose={(e)=>handleDisplay()}
        size="lg"
        color={'info'}
      >
        <CModalHeader closeButton>New Professional</CModalHeader>
        <CModalBody>
          <CForm>
            <CFormGroup>
              <CRow>
                <CCol>
                  <CInput id="name" name="name" placeholder="Name" value={formik.values.name} onChange={formik.handleChange} />
                  <p className="text-warning" >{formik.errors.name?formik.errors.name:null}</p>
                </CCol>
                <CCol>
                  <CInput id="nickname" name="nickname" placeholder="NickName" value={formik.values.nickname} onChange={formik.handleChange}/>
                  <p className="text-warning" >{formik.errors.nickname?formik.errors.nickname:null}</p>
                </CCol>
                <CCol>
                  <CInput type={'number'} id="amount_patients" name="amount_patients" placeholder="Amount Patients" value={formik.values.amount_patients} onChange={formik.handleChange}/>
                  <p className="text-warning" >{formik.errors.amount_patients?formik.errors.amount_patients:null}</p>
                </CCol>
                <CCol>
                  <CInput type={'date'} id="duration_time" name="duration_time" placeholder="duration_time" value={formik.values.duration_time} onChange={formik.handleChange}/>
                </CCol>
              </CRow>
              <CRow>
                <CCol>
                  <CInput type={'number'} id="amount_suitable_overflow" name="amount_suitable_overflow" placeholder="Amount Suitable Overflow" value={formik.values.amount_suitable_overflow} onChange={formik.handleChange} />
                  <p className="text-warning" >{formik.errors.amount_suitable_overflow?formik.errors.amount_suitable_overflow:null}</p>
                </CCol>
                <CCol>
                  <CInput type={'number'} id="deleted" name="deleted" placeholder="Amount Suitable deleted" value={formik.values.deleted} onChange={formik.handleChange} />
                  <p className="text-warning" >{formik.errors.deleted?formik.errors.deleted:null}</p>
                </CCol>
                <CCol>
                  <CInput id="fk_license" name="fk_license" placeholder="Fk License" value={formik.values.fk_license} onChange={formik.handleChange}/>
                </CCol>
              </CRow>
              <CRow>
                <CCol>
                  <CInput type={'number'} id="color" name="color" placeholder="Color" value={formik.values.color} onChange={formik.handleChange}/>
                </CCol>
                <CCol></CCol>
                <CCol></CCol>
              </CRow>
              <CFormText className="help-block" color={'danger'}>{mess}</CFormText>
            </CFormGroup>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton onClick={formik.handleSubmit} type="submit" color="info">Submit</CButton>{' '}
          <CButton
            color="secondary"
            onClick={(e) => handleDisplay()}
          >Cancel</CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default Category
